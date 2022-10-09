import { UpdateStorage } from "./storage";
import { WriterBuilder } from "./writer_builder";

export class UpdateQueryBuilder extends WriterBuilder{
  protected _queryStorage: UpdateStorage<any>;
  
  get queryStorage(): UpdateStorage<any> {
    return this._queryStorage
  }

  constructor(builderOrType: WriterBuilder | string, target: Function) {
    super(builderOrType, target);
    this._queryStorage.values = {};
  }

  set(value: object): this {
    this._queryStorage.values = value;
    return this;
  }
}
