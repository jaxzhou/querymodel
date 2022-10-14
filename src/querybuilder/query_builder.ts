import { assignIn, clone, find, isArray, isString } from "lodash";
import { QueryStorage } from "./storage";
import {
  aggFunc,
  aggRegex,
  ColumnSelection,
  Condition,
  fieldRegex,
  isConditionType,
  Selection,
  stringToCondition,
  JoinType,
  Joins,
  Order,
  Nulls,
} from "../schema";
import { getTableDefinition } from "../decorators/entity";
import { getQueryDefinition } from "../decorators/query";
import { ColumDefinition, getColumnDefinitions, getSelectionDefinitions } from "../decorators";

export type SubQuery = {
  alias: string;
  subBuilder: SelectQueryBuilder;
};

export type SelectQueryStorage = QueryStorage & {
  subQueries: SubQuery[];
};

export class SelectQueryBuilder {

  protected _sourceType: string;

  get sourceType(): string {
    return this._sourceType;
  }

  protected _queryStorage: SelectQueryStorage;

  get queryStorage(): SelectQueryStorage {
    return this._queryStorage;
  }

  get subQueries(): SubQuery[] {
    return this._queryStorage.subQueries;
  }

  constructor(builderOrType: SelectQueryBuilder | string) {
    if (builderOrType instanceof SelectQueryBuilder) {
      this._queryStorage = clone(builderOrType.queryStorage); 
      this._sourceType = builderOrType.sourceType;
    } else {
      this._queryStorage = {
        subQueries: [],
        from: undefined,
        selections: [],
        joins: [],
        conditions: {
          type: 'and',
          conditions: []
        },
        orderBy: [],
        groupBy: [],
        distinct: [],
        params: {},
      };
      this._sourceType = builderOrType;
    }
  }

  select(field: Selection | ColumDefinition, alias?: string): this {
    if ('name' in field) {
      const column: ColumnSelection = {
        content: field.name,
        type: field.type,
        alias: alias || field.alias,
      };
      this.queryStorage.selections.push(column)
    } else {
      if (alias) {
        field.alias = alias;
      }
      this.queryStorage.selections.push(field);
    }
    return this;
  }

  distinct(...fields: string[]): this {
    this.queryStorage.distinct.push(...fields);
    return this;
  }

  groupBy(...fields: string[]): this {
    this.queryStorage.groupBy.push(...fields);
    return this;
  }

  offset(offset: number): this {
    this.queryStorage.offset = offset;
    return this;
  }

  limit(limit: number): this {
    this.queryStorage.limit = limit;
    return this;
  }

  orderBy(field: string, order: Order, nulls?: Nulls): this {
    this.queryStorage.orderBy.push({
      fieldOrSelection: field,
      order,
      nulls
    });
    return this;
  }


  from(target: Function | string, alias?:string): this {
    if (isString(target)) {
      this.queryStorage.from = {
        rawString: target
      };
      return this;
    }
    const table = getTableDefinition(target, this.sourceType);
    if (table) {
      this.queryStorage.from = {
        schema: table.schema,
        name: table.name,
        alias: alias || table.name,
        target,
      };
      return this;
    }
    const query = getQueryDefinition(target, this.sourceType);
    if (query) {
      if (!alias) {
        throw new Error('Need an alias for query');
      }
      const queryBuilder = new SelectQueryBuilder(this.sourceType);
      const subQuery = query(queryBuilder);
      const columns = getColumnDefinitions(target, this.sourceType);
      for  (const column of columns) {
        subQuery.select(column);
      }
      const querySelections = getSelectionDefinitions(target, this.sourceType);
      for (const selection of querySelections) {
        subQuery.select(selection);
      }
      for (const sub of subQuery.subQueries) {
        if (!find(this.queryStorage.subQueries, s => s.alias  === sub.alias)) {
          this.queryStorage.subQueries.push(sub);
        }
      }
      if (!find(this.queryStorage.subQueries, s => s.alias  === alias)) {
        this.queryStorage.subQueries.push({
          subBuilder: subQuery,
          alias,
        });
      }
      this.queryStorage.from = { alias, target };
    }
    return this;
  }

  where(condition: string
    | { [key: string]: any }
    | Condition,
    params?: { [key: string]: any }): this {
    if (params) {
      assignIn(this.queryStorage.params, params);
    }
    if (typeof condition === 'string') {
      const exp = stringToCondition(condition);
      if (exp) {
        this.queryStorage.conditions.conditions.push(exp);
      }
    } else if (isConditionType(condition)) {
      if ('type' in condition && !this.queryStorage.conditions.conditions.length) {
        this.queryStorage.conditions = condition;
      } else {
        this.queryStorage.conditions.conditions.push(condition);
      }
    } else {
      Object.keys(condition).forEach((field) => {
        const sub = this.queryStorage.subQueries.find(s => s.alias === field);
        const fieldValue = condition[field];
        if (sub) {
          sub.subBuilder.where(fieldValue);
          return;
        }
        const fieldName = field.replace('.', '_');
        this.queryStorage.params[fieldName] = fieldValue;
        this.queryStorage.conditions.conditions.push({
          fieldsOrParams: [field, `:${fieldName}`],
          operator: isArray(fieldValue) ? 'in' : '='
        });
      });
    }
    return this;
  }

  join(target: Function, alias: string, condition: string): this

  join(target: Function, alias: string, condition: Condition): this

  join(target: Function, alias: string, condition: string | Condition): this {
    this.joinEntity(JoinType.innerJoin, target, alias, condition);
    return this;
  }

  leftJoin(target: Function, alias: string, condition:string): this

  leftJoin(target: Function, alias: string, condition: Condition): this

  leftJoin(target: Function, alias: string, condition: string|Condition): this {
    this.joinEntity(JoinType.leftJoin, target, alias, condition);
    return this;
  }

  rightJoin(target: Function, alias: string, condition:string): this

  rightJoin(target: Function, alias: string, condition: Condition): this

  rightJoin(target: Function, alias: string, condition: string|Condition): this {
    this.joinEntity(JoinType.rightJoin, target, alias, condition);
    return this;
  }

  innerJoin(target: Function, alias: string, condition:string): this

  innerJoin(target: Function, alias: string, condition: Condition): this

  innerJoin(target: Function, alias: string, condition: string|Condition): this {
    this.joinEntity(JoinType.innerJoin, target, alias, condition);
    return this;
  }

  fullJoin(target: Function, alias: string, condition:string): this

  fullJoin(target: Function, alias: string, condition: Condition): this

  fullJoin(target: Function, alias: string, condition: string|Condition): this {
    this.joinEntity(JoinType.fullJoin, target, alias, condition);
    return this;
  }

  outerJoin(target: Function, alias: string, condition:string): this

  outerJoin(target: Function, alias: string, condition: Condition): this

  outerJoin(target: Function, alias: string, condition: string|Condition): this {
    this.joinEntity(JoinType.outerJoin, target, alias, condition);
    return this;
  }

  protected joinEntity(type: JoinType, target: Function, alias: string, condition: string|Condition) {
    const joinCondition = isString(condition) ? stringToCondition(condition) : condition;
    const join: Joins = {
      alias,
      type,
      conditions: joinCondition,
    };
    const table = getTableDefinition(target, this.sourceType);
    if (table) {
      join.tableName = table.name;
      join.schema = table.schema;
    }
    const query = getQueryDefinition(target, this.sourceType);
    if (query) {
      const queryBuilder = new SelectQueryBuilder(this.sourceType);
      const subQuery = query(queryBuilder);
      const columns = getColumnDefinitions(target, this.sourceType);
      for  (const column of columns) {
        subQuery.select(column);
      }
      const querySelections = getSelectionDefinitions(target, this.sourceType);
      for (const selection of querySelections) {
        subQuery.select(selection);
      }
      for (const sub of subQuery.subQueries) {
        if (!find(this.queryStorage.subQueries, s => s.alias  === sub.alias)) {
          this.queryStorage.subQueries.push(sub);
        }
      }
      if (!find(this.queryStorage.subQueries, s => s.alias  === alias)) {
        this.queryStorage.subQueries.push({
          subBuilder: subQuery,
          alias,
        });
      }
    }
    this.queryStorage.joins.push(join);
  }

  bind(params: {[key:string]: any}): this {
    assignIn(this.queryStorage.params, params);
    return this;
  }
}
