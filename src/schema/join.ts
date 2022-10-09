import { Condition } from "./condition";

export enum JoinType {
  innerJoin = 'INNER JOIN',
  leftJoin = 'LEFT JOIN',
  rightJoin = 'RIGHT JOIN',
  outerJoin = 'OUTER JOIN',
  fullJoin = 'FULL JOIN',
};

export type Joins = {
  schema?: string;
  tableName?: string;
  alias: string;
  type: JoinType;
  conditions: Condition;
}