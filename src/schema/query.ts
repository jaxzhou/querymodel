import { Condition } from "./condition";
import { Selection } from "./selection";
import { Table } from "./entity";
import { Joins } from "./join";
import { OrderBy } from "./order";

export type RawQuery = {
  rawString: string;
}; 

export type AliasQuery = {
  alias: string;
  target: Function;
}; 

export type QueryDescription = {
  from: Table | AliasQuery | RawQuery | undefined;
  selections: Selection[];
  conditions: Condition;
  joins: Joins[];
  groupBy: string[];
  orderBy: OrderBy[];
  distinct: string[];
  limit?: number;
  offset?: number;
  target?: Function;
}
