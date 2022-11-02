import { get, isBoolean, isDate, isNumber, isPlainObject, isString } from "lodash";

export type BasicDataType = string | number | boolean | Date;

export function isBasicDataType(value: any): value is BasicDataType {
  return isString(value) || isNumber(value) || isBoolean(value) || isDate(value);
}

export const operationExp = /(.*)\s(=|<|<=|>|>=|<>|LIKE|ILIKE|IN|IS)\s(.*)/i;
export const conditonRegexp = /^\w+(\snot)?\s(=|<|<=|>|>=|<>|LIKE|ILIKE|IN|IS)\s\w+/i;
export type Operator = 
  | ">"
  | ">="
  | "<"
  | "<="
  | "="
  | "<>"
  | "between"
  | "like"
  | "ilike"
  | "in";

export type FiledExpression = BasicDataType | Array<BasicDataType> | {
  operator: Operator;
  value: FiledExpression;
}

export type FieldCondition = {
  field: string;
  expression: FiledExpression;
}

export type ComposeType = 'and' | 'or';

export type ComposeCondition = {
  type: ComposeType;
  conditions: (FieldCondition|ComposeCondition)[];
}

export type Condition = ComposeCondition | FieldCondition;

export function isConditionType(target: any): target is Condition {
  return ('field' in target && 'expression' in target) || ('type' in target && 'condition' in target);
} 

export type ObjectConditionType<T> = {
  [key in keyof T]?: ConditionType<T[key]>
} & {
  and?: ObjectConditionType<T>;
  or?: ObjectConditionType<T>;
};

export type ConditionType<T> = T extends BasicDataType ? T | T[] | FiledExpression: ObjectConditionType<T>;

export function objectToCondition<T>(object: ObjectConditionType<T>, type: ComposeType = 'and' ): ComposeCondition {
  const conditions = Object.keys(object).map((field) => {
    const value = get(object, field);
    if (field === 'and' || field === 'or') {
      if (!isPlainObject(value)) {
        throw new Error('Wrong Composed Condition Types');
      }
      return objectToCondition(value, field);
    }
    return <FieldCondition>{
      field,
      expression: value
    };
  });
  return {
    type,
    conditions,
  }
}

export const GT = (value: FiledExpression): FiledExpression => ({
  operator: '>',
  value
});

export const GTE = (value: FiledExpression): FiledExpression => ({
  operator: '>=',
  value
});

export const LT = (value: FiledExpression): FiledExpression => ({
  operator: '<',
  value
});

export const LTE = (value: FiledExpression): FiledExpression => ({
  operator: '<=',
  value
});

export const EQ = (value: FiledExpression): FiledExpression => ({
  operator: '=',
  value
});

export const IN = (value: FiledExpression): FiledExpression => ({
  operator: 'in',
  value
});

export const NEQ = (value: FiledExpression): FiledExpression => ({
  operator: '<>',
  value
});

export const BETWEEN = (value1: number | Date, value2: number | Date): FiledExpression => ({
  operator: 'between',
  value: [value1, value2]
});

export const LIKE = (value: string): FiledExpression => ({
  operator: 'like',
  value
});
export const ILIKE = (value: string): FiledExpression => ({
  operator: 'ilike',
  value
});