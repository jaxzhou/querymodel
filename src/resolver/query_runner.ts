import { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "../querybuilder";

export type ExecuteResult = {
  affectRows: number;
}

export interface IQueryRunner {
  query<T>(builder: SelectQueryBuilder): Promise<T[]>;

  execute(builder: DeleteQueryBuilder|InsertQueryBuilder|UpdateQueryBuilder): Promise<ExecuteResult>;

  startTransaction(): Promise<void>;

  commitTransaction(): Promise<void>;

  rollbackTransaction(): Promise<void>;

  close(): Promise<void>;
}