
import { InsertStorage } from "./storage";
import { WriterBuilder } from "./writer_builder";

export class InsertQueryBuilder extends WriterBuilder{
  protected _queryStorage: InsertStorage<any>;
  
  get queryStorage(): InsertStorage<any> {
    return this._queryStorage
  }
  
  constructor(builderOrType: WriterBuilder | string, target: Function) {
    super(builderOrType, target);
    this._queryStorage.values = [];
  }

  insert(values: any[]): this {
    this._queryStorage.values.push(...values);
    return this;
  }
}
