
import { DeleteStorage, InsertStorage, UpdateStorage } from "./storage";
import { WriterBuilder } from "./writer_builder";

export class DeleteQueryBuilder extends WriterBuilder{
  protected _queryStorage: DeleteStorage<any>;

  get queryStorage(): DeleteStorage<any> {
    return this._queryStorage
  }
  
  constructor(builderOrType: WriterBuilder | string, target: Function) {
    super(builderOrType, target);
  }
}
