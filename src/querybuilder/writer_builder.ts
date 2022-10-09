import { assign, assignIn, clone, isArray, isString } from "lodash";
import { getTableDefinition } from "../decorators/entity";
import { Condition, isConditionType, objectToCondition, stringToCondition } from "../schema";
import { DeleteStorage, InsertStorage, UpdateStorage } from "./storage";

export class WriterBuilder {
  protected _sourceType: string;

  get sourceType(): string {
    return this._sourceType;
  }
  
  protected _queryStorage: InsertStorage<any> | UpdateStorage<any> | DeleteStorage<any>;;

  get queryStorage(): InsertStorage<any> | UpdateStorage<any> | DeleteStorage<any> {
    return this._queryStorage;
  }


  constructor(builderOrType: WriterBuilder | string, target: Function) {
    if (builderOrType instanceof WriterBuilder) {
      this._queryStorage = clone(builderOrType.queryStorage); 
      this._sourceType = builderOrType.sourceType;
    } else {
      const table = getTableDefinition(target, this.sourceType);
      if (!table) {
        throw new Error('Write target Should be defined as table')
      }
      this._queryStorage = {
        entity: {
          name: table.name,
          schema: table.schema,
          alias: table.name,
          target,
        },
        conditions: {
          type: 'and',
          conditions: []
        },
        params: {},
      };
      this._sourceType = builderOrType;
    }
  }

  where(condition: string
    | { [key: string]: any }
    | Condition,
    params?: { [key: string]: any }): this {
    if (params) {
      assignIn(this.queryStorage.params, params);
    }
    if (isString(condition)) {
      this.queryStorage.conditions.conditions.push(stringToCondition(condition));
    } else if (isConditionType(condition)) {
      if ('type' in condition && !this.queryStorage.conditions.conditions.length) {
        this._queryStorage.conditions = condition;
      } else {
        this.queryStorage.conditions.conditions.push(condition);
      }
    } else {
      const converted = objectToCondition(condition);
      if (converted.params) {
        assignIn(this.queryStorage.params, converted.params);
      }
      if (!this.queryStorage.conditions.conditions.length) {
        this._queryStorage.conditions = converted.condition;
      } else {
        this.queryStorage.conditions.conditions.push(converted.condition);
      }
    }
    if (params) {
        assignIn(this.queryStorage.params, params);
    }
    return this;
  }
}