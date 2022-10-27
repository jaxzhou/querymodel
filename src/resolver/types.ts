import { Nulls, ObjectConditionType, Order } from "../schema";

export type ClassType<T = any> = { new(...args: any[]): T };

export type OrderExpression = {
  [key: string]: Order | {
    order: Order,
    nulls?: Nulls,
  }
};

export type PaginationExpression = {
  limit?: number;
  offset?: number;
};

export type QueryCondition<T> = ObjectConditionType<T>;

export type QueryExpression<T> = {
  where: QueryCondition<T>,
  pagination?: PaginationExpression,
  order?: OrderExpression;
} | QueryCondition<T>;

export type UpdateObject<T> = {
  [p in keyof T]?: T[p];
}
