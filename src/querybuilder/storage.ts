import { ComposeCondition, QueryDescription, Table } from "../schema";

type ConditionStorage = {
   conditions: ComposeCondition;
   params: {
      [key:string]: any
   }
}

export type UpdateStorage<T> = {
   entity: Table,
   values: Partial<T>;
} & ConditionStorage

export type InsertStorage<T> = {
   entity: Table,
   values: Partial<T>[];
} & ConditionStorage;

export type DeleteStorage<T> = {
   entity: Table,
} & ConditionStorage

export type QueryStorage = QueryDescription & ConditionStorage;
