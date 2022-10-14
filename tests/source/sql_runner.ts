import { DeleteQueryBuilder, InsertQueryBuilder, SelectQueryBuilder, UpdateQueryBuilder } from "../../src/querybuilder";
import { ExecuteResult, IQueryRunner } from "../../src/resolver";
import SqlResolver from "../../src/resolver/sql_resolver";
import { sqlClient, SqlClient } from "./sql_client";

export class SqlRunner implements IQueryRunner {
  protected _client: SqlClient;

  constructor() {
    this._client = sqlClient;
  }

  query<T>(builder: SelectQueryBuilder): Promise<T[]> {
    const resolver = new SqlResolver(builder);
    const sql = resolver.getSql().toNative();
    this._client.query(sql.sql, <any[]>sql.bindings)
    return Promise.resolve([]);
  }

  execute(builder: DeleteQueryBuilder | InsertQueryBuilder | UpdateQueryBuilder): Promise<ExecuteResult> {
    const resolver = new SqlResolver(builder);
    const sql = resolver.getSql().toNative();
    this._client.query(sql.sql, <any[]>sql.bindings)
    return Promise.resolve({
      affectRows: 0
    });
  }

  startTransaction(): Promise<void> {
    this._client.query('Start Transaction');
    return Promise.resolve();
  }

  commitTransaction(): Promise<void> {
    this._client.query('Commit Transaction');
    return Promise.resolve();
  }
  
  rollbackTransaction(): Promise<void> {
    this._client.query('Rollback Transaction');
    return Promise.resolve();
  }

  close(): Promise<void> {
    this._client.close();
    return Promise.resolve();
  }
}