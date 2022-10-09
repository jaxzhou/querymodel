
class SqlTypeMapping {

  _mapping: {[key:string]: string} = {
    StarRocks: 'mysql',
    Trino: 'pg',
    SqlLite: 'sqlite3',
    Postgres: 'pg',
    MySql: 'mysql',
  }

  get(sourceType: string): string {
    return this._mapping[sourceType] || sourceType;
  }

  registerSource(sourceType: string, sqlType: string) {
    this._mapping[sourceType] = sqlType;
  }
}

export default new SqlTypeMapping();
