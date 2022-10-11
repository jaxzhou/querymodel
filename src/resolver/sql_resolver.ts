import knex, {Knex} from "knex";
import { get, isArray, isNumber, isPlainObject, isString } from 'lodash';
import SqlTypeMapping from './sql_type_mapping';
import { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder, WriterBuilder } from "../querybuilder";
import { Condition, FieldCondition, JoinType, RawCondition, Table, Selection } from "../schema";

function getFullTableName(table: Table): string {
  return table.schema ? `${table.schema}.${table.name}` : table.name;
}

export const paramRegex = /:[\w+_-]{1,}/g;

export default class SqlResolver {
  protected knex: Knex;

  protected type: string;

  protected sqlBuilder: Knex.QueryBuilder;

  protected queryKeeper: SelectQueryBuilder | WriterBuilder;

  constructor(keeper: SelectQueryBuilder | WriterBuilder, builder?: Knex.QueryBuilder) {
    this.type = SqlTypeMapping.get(keeper.sourceType);
    this.knex =  knex({client: this.type});
    this.queryKeeper = keeper;
    this.sqlBuilder = builder ?? this.knex.queryBuilder();
  }

  resolveQuery() {
    if (this.queryKeeper instanceof SelectQueryBuilder) {
      this.resolveSelectBuilder(this.queryKeeper)
    }
    return this.sqlBuilder;
  }

  resolveSubQuery() {
    if (this.queryKeeper instanceof SelectQueryBuilder) {
      const subQueries = this.queryKeeper.queryStorage.subQueries;
      const params = this.queryKeeper.queryStorage.params;
      subQueries.forEach((sub) => {
        this.sqlBuilder.with(sub.alias, (sq: Knex.QueryBuilder) => {
          sub.subBuilder.bind(params);
          const subResolver = new SqlResolver(sub.subBuilder, sq);
          subResolver.resolveQuery();
          return sq;
        });
      });
    }
  }

  getSql(): Knex.Sql {
    if (this.queryKeeper instanceof SelectQueryBuilder) {
      this.resolveSubQuery();
      this.resolveQuery();
    } else if (this.queryKeeper instanceof DeleteQueryBuilder) {
      this.resolveDeleteBuilder(this.queryKeeper)
    } else if (this.queryKeeper instanceof UpdateQueryBuilder) {
      this.resolveUpdateBuilder(this.queryKeeper)
    } else if (this.queryKeeper instanceof InsertQueryBuilder) {
      this.resolveInsertBuilder(this.queryKeeper)
    }
    return this.sqlBuilder.toSQL();
  }

  protected resolveSelectBuilder(select: SelectQueryBuilder) {
    const from = select.queryStorage.from;
    if (!from) {
      throw new Error('Miss from source');
    }
    if ('name' in from) {
      const alias = from.alias;
      const tableName = getFullTableName(from);
      this.sqlBuilder.from(`${tableName} as ${alias}`);
    } else if ('rawString' in from) {
      this.sqlBuilder.fromRaw(from.rawString);
    } else {
      this.sqlBuilder.from(from.alias);
    }
    this.resolveJoins(select);
    this.resolveSelections(select);
    this.resolveWhere(select);
    this.resolveOrders(select);
    this.resolveGroupBy(select);
    this.resolvePagination(select);
  }

  protected resolveDeleteBuilder(delBuilder: DeleteQueryBuilder) {
    const from = delBuilder.queryStorage.entity;
    this.sqlBuilder.delete().from(getFullTableName(from));
    this.resolveWhere(delBuilder);
  }

  protected resolveUpdateBuilder(upBuilder: UpdateQueryBuilder) {
    const from = upBuilder.queryStorage.entity;
    Object.keys(upBuilder.queryStorage.values).forEach((k) => {
      const value = get(upBuilder.queryStorage.values, k);
      if (isPlainObject(value) && 'rawString' in value) {
        this.sqlBuilder.update({[k]: this.knex.raw(value.rawString)});
      } else {
        this.sqlBuilder.update(k, value);
      }
    });
    this.sqlBuilder.from(getFullTableName(from));
    this.resolveWhere(upBuilder);
  }

  protected resolveInsertBuilder(insertBuilder: InsertQueryBuilder) {
    const from = insertBuilder.queryStorage.entity;
    this.sqlBuilder.insert(insertBuilder.queryStorage.values).from(getFullTableName(from));
  }

  protected resolveJoins(select: SelectQueryBuilder) {
    const joins = select.queryStorage.joins;
    joins.forEach((join) => {
      let joinMethod = this.sqlBuilder.innerJoin.bind(this.sqlBuilder);
      if (join.type === JoinType.leftJoin) {
        joinMethod = this.sqlBuilder.leftJoin.bind(this.sqlBuilder);
      }
      if (join.type === JoinType.rightJoin) {
        joinMethod = this.sqlBuilder.rightJoin.bind(this.sqlBuilder);
      }
      if (join.type === JoinType.outerJoin) {
        joinMethod = this.sqlBuilder.outerJoin.bind(this.sqlBuilder);
      }
      if (join.type === JoinType.fullJoin) {
        joinMethod = this.sqlBuilder.fullOuterJoin.bind(this.sqlBuilder);
      }
      let joinSql = join.alias;
      if (join.tableName) {
        const tableName = join.schema ? `${join.schema}.${join.tableName}` : join.tableName;
        joinSql = `${tableName} as ${joinSql}`;
      }
      joinMethod(joinSql, (joinOn) => {
        const bindJoin = (conditions: Condition, jm: Knex.JoinClause) => {
          if ('type' in conditions) {
            const type = conditions.type;
            if (type === 'and') {
              for (const c of conditions.conditions) {
                jm.andOn((sub) => {
                    bindJoin(c, sub);
                });
              }
            } else {
              for (const c of conditions.conditions) {
                jm.orOn((sub) => {
                    bindJoin(c, sub);
                });
              }
            }
            return;
          }
          const raw = this.resolveCondition(conditions, select.queryStorage.params);
          jm.andOn(raw)
        };
        bindJoin(join.conditions, joinOn);
      });
    });
  }

  protected convertField(field: string, params: {[key:string]: any}): {sql: string, bindings: any[]} {
    const converted: {sql: string, bindings: any[]} = {
      sql: field,
      bindings: [],
    }
    if (this.queryKeeper instanceof SelectQueryBuilder) {
      const selection = this.queryKeeper.queryStorage.selections.find(s => {
        if (s.alias) {
          return s.alias === field;
        }
        if ('content' in s) {
          return s.content === field;
        }
        return false;
      });
      if (selection) {
        converted.sql = this.convertSelection(selection);
      }
    }
    const matches = field.match(paramRegex);
    if (matches) {
      for (const match of matches) {
        const paramName = match.replace(':', '');
        const paramValue = params[paramName];
        if (isArray(paramValue)) {
          if (paramValue.length === 0) {
            return {
              sql: 'false',
              bindings: [],
            };
          }
          converted.sql = converted.sql.replace(match, `(${paramValue.map(_ => '?').join(',')})`);
          converted.bindings.push(...paramValue);
        } else if (paramValue !== undefined) {
          converted.sql = converted.sql.replace(match, '?');
          converted.bindings.push(paramValue);
        }
      }
    }
    return converted;
  }

  protected resolveCondition(condition: FieldCondition | RawCondition, params: {[key:string]: any}): Knex.Raw {
    if ('rawString' in condition) {
      let rawSql = condition.rawString;
      const matches = rawSql.match(paramRegex) || [];
      const bindings = [];
      for (const match of matches) {
        const n = match.replace(':', '');
        const v = params[n];
        if (v === undefined) {
          continue;
        }
        if (isArray(v)) {
          if (!v.length) {
            rawSql = 'false';
          } else {
            rawSql = rawSql.replace(match, `(${v.map( _ => '?').join(',')})`);
            bindings.push(...v);
          }
        } else {
          rawSql = rawSql.replace(match, '?');
          bindings.push(v);
        }
      }
      return this.knex.raw(rawSql, bindings);
    }
    const {
      fieldsOrParams,
      operator,
      not
    } = condition;
    const field1 = this.convertField(fieldsOrParams[0], params);
    const field2 = this.convertField(fieldsOrParams[1], params);
    if (field1.sql === 'false' || field2.sql === 'false') {
      return this.knex.raw('false');
    }
    const rawSql = `${field1.sql}${not ?  ' NOT': ''} ${operator} ${field2.sql}`;
    const bindings = [...field1.bindings, ...field2.bindings];
    return this.knex.raw(rawSql, bindings);
  }

  protected resolveSelections(select: SelectQueryBuilder) {
    const selections = select.queryStorage.selections;
    for (const selection of selections) {
      let sql = this.convertSelection(selection);
      if (selection.alias) {
        sql = `${sql} as ${selection.alias}`;
      }
      this.sqlBuilder.select(this.knex.raw(sql, select.queryStorage.params));
    }
  }

  protected convertSelection(selection: Selection): string {
    if ('content' in selection) {
      return selection.content;
    }
    const { func, params } = selection;
    const converted = params.map((p) => {
      if (isString(p)) {
        return p;
      }
      return this.convertSelection(p);
    });
    const sql = `${func}(${converted.join(',')})`;
    return sql;
  }

  protected resolveWhere(select: SelectQueryBuilder | DeleteQueryBuilder | UpdateQueryBuilder) {
    const conditions = select.queryStorage.conditions;
    let whereClause = this.sqlBuilder.andWhere.bind(this.sqlBuilder);
    if ('type' in conditions) {
      if (conditions.type === 'or') {
        whereClause = this.sqlBuilder.orWhere.bind(this.sqlBuilder);
      }
    }
    this.bindWhereConditions(select, conditions, this.sqlBuilder, whereClause);
  }

  protected bindWhereConditions(select: SelectQueryBuilder | DeleteQueryBuilder | UpdateQueryBuilder, condition: Condition, qb: Knex.QueryBuilder, whereClause: Knex.Where) {
    if ('type' in condition) {
      if (!condition.conditions.length) {
        return;
      }
      for (const sub of condition.conditions) {
        if ('type' in sub) {
          whereClause((sq) => {
            let subWehre = sq.andWhere.bind(sq);
            if (sub.type === 'or') {
              subWehre = sq.orWhere.bind(sq);
            }
            this.bindWhereConditions(select, sub, sq, subWehre);
          });
        } else {
          this.bindWhereConditions(select, sub, qb, whereClause);
        }
      }
      return;
    }
    const raw = this.resolveCondition(condition, select.queryStorage.params);
    try {
      const {sql, bindings} = raw.toSQL();
      if (/^(cout|sum|min|max|avg)\((.*)\)/i.test(sql)) {
        this.sqlBuilder.havingRaw(sql, bindings);
      } else {
        whereClause(raw);
      }
    } catch(e) {
      console.info(condition, select.queryStorage.params);
      throw e;
    }
  }


  protected resolveOrders(select: SelectQueryBuilder) {
    const orders = select.queryStorage.orderBy;
    for (const order of orders) {
      this.sqlBuilder.orderBy(order.fieldOrSelection, order.order, order.nulls);
    }
  }

  protected resolveGroupBy(select: SelectQueryBuilder) {
    const groups = select.queryStorage.groupBy;
    for (const group of groups) {
      const selection = select.queryStorage.selections.find(s => {
        if (s.alias) {
          return s.alias === group;
        }
        if ('content' in s) {
          return s.content === group;
        }
        return false;
      });
      if (selection && 'func' in selection) {
        const selectIndex = select.queryStorage.selections.indexOf(selection);
        this.sqlBuilder.groupBy(selectIndex + 1);
      } else {
        this.sqlBuilder.groupBy(group);
      }
    }
  }

  protected resolveDistinct(select: SelectQueryBuilder) {
    const distincts = select.queryStorage.distinct;
    this.sqlBuilder.distinct(...distincts);
  }

  protected resolvePagination(select: SelectQueryBuilder) {
    if (isNumber(select.queryStorage.limit)) {
      this.sqlBuilder.limit(select.queryStorage.limit);
    }
    if (isNumber(select.queryStorage.offset)) {
      this.sqlBuilder.offset(select.queryStorage.offset);
    }
  }
}
