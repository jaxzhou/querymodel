
export class SqlClient {
  query(sql: string, bindings?: any[]): Promise<boolean> {
    return Promise.resolve(true);
  }

  close(): Promise<boolean> {
    return Promise.resolve(true);
  }
}

export const sqlClient = new SqlClient();