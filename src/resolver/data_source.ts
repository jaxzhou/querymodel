import { plainToInstance } from 'class-transformer';
import { ClassType, QueryCondition, QueryExpression, UpdateObject } from "./types";
import { ExecuteResult, IQueryRunner } from "./query_runner";
import { getTableDefinition } from "../decorators/entity";
import { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "../querybuilder";
import { getColumnDefinitions } from "../decorators/column";
import { getSelectionDefinitions } from "../decorators/selection";
import { getQueryDefinition } from "../decorators/query";
import { get, isString } from 'lodash';
import { count } from '../schema';

export abstract class DataSource {
  protected runner: IQueryRunner;

  protected sourceType: string;

  async getOne<T>(target: ClassType<T>, condition: QueryExpression<T>): Promise<T|undefined> {
    const values = await this.getMany<T>(target, condition);
    return values[0];
  }

  async getMany<T>(target: ClassType<T>, condition: QueryExpression<T>): Promise<T[]> {
    const selectBuilder = new SelectQueryBuilder(this.sourceType);
    const table = getTableDefinition(target, this.sourceType);
    if (table) {
      selectBuilder.from(target);
    } else {
      const query = getQueryDefinition(target, this.sourceType);
      if (query) {
        query(selectBuilder);
      }
    }
    if ('where' in condition) {
      selectBuilder.where(condition.where);
      if (condition.pagination) {
        if (condition.pagination.limit) {
          selectBuilder.limit(condition.pagination.limit);
        }
        if (condition.pagination.offset) {
          selectBuilder.offset(condition.pagination.offset);
        }
      }
      if (condition.order) {
        Object.keys(condition.order).forEach((k) => {
          const order = get(condition.order, k);
          if (!order) {
            return;
          }
          if (isString(order)) {
            selectBuilder.orderBy(k, order);
            return;
          }
          selectBuilder.orderBy(k, order.order, order.nulls);
        });
      }
    } else {
      selectBuilder.where(condition)
    }
    const columns = getColumnDefinitions(target, this.sourceType);
    for (const column of columns) {
      selectBuilder.select(column);
    }
    const selections = getSelectionDefinitions(target, this.sourceType);
    for (const select of selections) {
      selectBuilder.select(select);
    }
    const values = await this.runner.query(selectBuilder);
    return values.map(t =>  plainToInstance(target, t));
  }

  async getCount<T>(target: ClassType<T>, condition: QueryCondition<T>): Promise<number> {
    const selectBuilder = new SelectQueryBuilder(this.sourceType);
    const table = getTableDefinition(target, this.sourceType);
    if (table) {
      selectBuilder.from(target);
      selectBuilder.where(condition);
    } else {
      selectBuilder.from(target, 'sub');
      selectBuilder.where({'sub': condition});
    }
    selectBuilder.select(count('*'), 'count');
    const result: {count:number}[] = await this.runner.query(selectBuilder);
    return result[0]?.count ?? 0;
  }

  async delete<T>(target: ClassType<T>, condition: QueryCondition<T>): Promise<ExecuteResult> {
    const deleteBuilder = new DeleteQueryBuilder(this.sourceType, target);
    deleteBuilder.where(condition);
    return this.runner.execute(deleteBuilder);
  }

  async insert<T>(target: ClassType<T>, objects: Partial<T>[]): Promise<ExecuteResult> {
    const insertBuilder = new InsertQueryBuilder(this.sourceType, target);
    insertBuilder.insert(objects);
    return this.runner.execute(insertBuilder);
  }

  async update<T>(target: ClassType<T>, updateFields: UpdateObject<T>, condition: QueryCondition<T>): Promise<ExecuteResult> {
    const updateBuilder = new UpdateQueryBuilder(this.sourceType, target);
    updateBuilder.where(condition);
    updateBuilder.set(updateFields);
    return this.runner.execute(updateBuilder);
  }

  async transaction(
    runInTransactionParam: (source: DataSource) => Promise<void>,
  ): Promise<void> {
    await this.runner.startTransaction();
    try {
      await runInTransactionParam(this);
    } catch (e) {
      await this.runner.rollbackTransaction();
      throw e;
    }
    await this.runner.commitTransaction();
  }

  async release() {
    await this.runner.close();
  }
}