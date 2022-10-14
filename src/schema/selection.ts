
export const aggRegex = /(min|max|avg|count|sum)\((.*)\)/i;
export const fieldRegex = /^\w+[.]?\w+$/i;
export type aggFunc = 'min'|'max'|'count'|'sum'|'avg';

export type ColumnSelection = {
  content: string;
  type?: string;
  alias?: string;
}

export type FuncParamType = string | FuncSelection;

export type FuncSelection = {
  func: string;
  params: FuncParamType[];
  alias?: string;
}

export type Selection = ColumnSelection | FuncSelection;

const convertToSelection = (funcName: string, ...params: FuncParamType[]): FuncSelection => {
  return {
    func: funcName,
    params,
  }
}

export const select = (sqlOrField: string ): Selection => {
  return {
    content: sqlOrField
  }
}

export const add = (...params: FuncParamType[]): FuncSelection => convertToSelection('add', ...params);

export const subtract = (...params: FuncParamType[]): FuncSelection => convertToSelection('subtract', ...params);

export const divide = (...params: FuncParamType[]): FuncSelection => convertToSelection('divide', ...params);

export const multiply = (...params: FuncParamType[]): FuncSelection => convertToSelection('multiply', ...params);

export const count = (param: FuncParamType): FuncSelection => convertToSelection('count', param);

export const sum = (param: FuncParamType): FuncSelection => convertToSelection('sum', param);

export const min = (param: FuncParamType): FuncSelection => convertToSelection('min', param);

export const max = (param: FuncParamType): FuncSelection => convertToSelection('max', param);

export const avg = (param: FuncParamType): FuncSelection => convertToSelection('avg', param);

export const distinct = (...params: FuncParamType[]): FuncSelection => convertToSelection('distinct', ...params);

export const count_if = (param: FuncParamType): FuncSelection => convertToSelection('count_if', param);

export const null_if = (expression: FuncParamType, value: FuncParamType): FuncSelection => convertToSelection('null_if', expression, value);

export const array_agg = (param: FuncParamType): FuncSelection => convertToSelection('array_agg', param);

export const date = (param: FuncParamType, timezone?: string): FuncSelection => {
  if (timezone) {
    return convertToSelection('date', param, timezone);
  }
  return convertToSelection('date', param);
};

export const now = (): FuncSelection => convertToSelection('now');

export const concat = (...params: FuncParamType[]): FuncSelection => convertToSelection('concat', ...params);