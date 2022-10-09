import { Condition, Nulls, Order, RawCondition } from "../schema";

export type BasicDataType = string | number | boolean | Date;

export type Inline<T extends object> = T;

export type Required<T> = never;

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

export type ConditionType<T> = T extends BasicDataType ? T | T[] | RawCondition: QueryCondition<T> ;

export type ObjectCondition<T> = {
  [p in keyof T as T[p] extends Required<T> ? never : p]?: T[p] extends Required<infer U> ? ConditionType<U> : ConditionType<T[p]>
};

export type QueryCondition<T> = Condition | ObjectCondition<T>;

export type Params<T> = {
  [p in keyof T as T[p] extends Required<T> ? p : never]: T[p] extends Required<infer U> ? ConditionType<U> : ConditionType<T[p]>
} & ({ [key: string] : any } | undefined);

export type QueryExpression<T> = {
  where: QueryCondition<T>,
  pagination?: PaginationExpression,
  order?: OrderExpression;
} | QueryCondition<T>;

export type UpdateObject<T> = {
  [p in keyof T]?: T[p] | {rawString: string};
}
