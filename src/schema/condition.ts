import exp from "constants";
import { isArray, isFunction, isObject } from "lodash";

export const operationExp = /(.*)\s(=|<|<=|>|>=|<>|LIKE|ILIKE|IN|IS)\s(.*)/i;
export const conditonRegexp = /^\w+(\snot)?\s(=|<|<=|>|>=|<>|LIKE|ILIKE|IN|IS)\s\w+/i;
export type Operator = 
  | ">"
  | ">="
  | "<"
  | "<="
  | "="
  | "<>"
  | "ilike"
  | "like"
  | "in"
  | "any"
  | "isNull"
  | 'unknown';

export type FieldCondition = {
  not?: boolean;
  operator: Operator;
  fieldsOrParams: [string, string];
}

export type RawCondition = {
  rawString: string;
}

export type ComposeCondition = {
  type: 'and' | 'or';
  conditions: (FieldCondition|RawCondition|ComposeCondition)[];
}

export type Condition = ComposeCondition | FieldCondition | RawCondition;

export function stringToCondition(condition: string): FieldCondition | RawCondition {
  if (conditonRegexp.test(condition)) {
    const matches = condition.match(conditonRegexp);
    if (matches && matches.length > 2) {
      const not = matches[1];
      const op = matches[2] as Operator;
      const fields = condition.split(`${not ? not : ''} ${op}`).map(f => f.trim());
      return {
        not: !!not,
        operator: op,
        fieldsOrParams: [fields[0], fields[1]]
      };
    }
  }
  return {
    rawString: condition
  };
}

export function objectToCondition(object: {[key: string]: any}): {
  condition: ComposeCondition,
  params?: {[key:string]: any}
} {
  const params: {[key:string]: any} = {};
  const conditions = Object.keys(object).map((field) => {
    const value = object[field];
    params[field] = value;
    return {
      fieldsOrParams: [field, `:${field}`],
      operator: isArray(value) ? 'in' : '='
    } as FieldCondition
  });
  return {
    condition: {
      type: 'and',
      conditions,
    },
    params
  }
}

export function isConditionType(target: any): target is Condition {
  if (!isObject(target)) {
    return false;
  }
  if ('rawString' in target) {
    return true;
  }
  if ('type' in target && 'conditions' in target) {
    return true;
  }
  if ('operator' in target && 'fieldsOrParams' in target) {
    return true;
  }
  return false;
}

export type ComposeConditionFunc = (...sqls: ConditionExpression[]) => ComposeCondition;

export type ConditionExpression = string | Condition;

export function raw(sql: string): RawCondition {
  return {
    rawString: sql
  }
};

export function and(...sqls: ConditionExpression[]): ComposeCondition {
  const cond: ComposeCondition = {
    type: 'and',
    conditions: []
  }
  for (const exp of sqls) {
    if (isConditionType(exp)) {
      cond.conditions.push(exp);
    } else {
      cond.conditions.push(stringToCondition(exp));
    }
  }
  return cond;
}

export function or(...sqls: ConditionExpression[]): ComposeCondition {
  const cond: ComposeCondition = {
    type: 'or',
    conditions: []
  }
  for (const exp of sqls) {
    if (isConditionType(exp)) {
      cond.conditions.push(exp);
    } else {
      cond.conditions.push(stringToCondition(exp));
    }
  }
  return cond;
}