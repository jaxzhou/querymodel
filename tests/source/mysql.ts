import { DataSource } from '../../src/resolver';
import { SqlRunner } from './sql_runner';

export class MySql extends DataSource {
  constructor() {
    super();
    this.sourceType = 'MySql';
    this.runner = new SqlRunner();
  }
}