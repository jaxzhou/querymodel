export const aggRegex = /(min|max|avg|count|sum)\((.*)\)/i;
export const fieldRegex = /^\w+[.]?\w+$/i;
export type aggFunc = 'min'|'max'|'count'|'sum'|'avg';

export type ColumnSelection = {
  entityRef?: string;
  column: string;
  type?: string;
  alias?: string;
}

export type AggSelection = {
  agg: aggFunc;
  entityRef?: string;
  column: string;
  alias?: string;
}

export type RawSelection = {
  agg?: aggFunc;
  rawString: string;
  alias?: string;
}

export type Selection = ColumnSelection | AggSelection | RawSelection;

const convertToSelection = (agg: aggFunc, sqlOrField: string): Selection => {
  if (fieldRegex.test(sqlOrField)) {
    const components = sqlOrField.split('.');
    return {
      agg,
      column: components[components.length - 1],
      entityRef: components.length > 1 ? components.slice(0, components.length - 1).join('.') : undefined,
    }
  }
  return  {
    agg,
    rawString: sqlOrField
  };
}

export const select = (sqlOrField: string): Selection => {
  if (fieldRegex.test(sqlOrField)) {
    const components = sqlOrField.split('.');
    return {
      column: components[components.length - 1],
      entityRef: components.length > 1 ? components.slice(0, components.length - 1).join('.') : undefined,
    }
  }
  return  {
    rawString: sqlOrField
  };
}

export const count = (sqlOrField: string): Selection => convertToSelection('count', sqlOrField);

export const sum = (sqlOrField: string): Selection => convertToSelection('sum', sqlOrField);

export const min = (sqlOrField: string): Selection => convertToSelection('min', sqlOrField);

export const max = (sqlOrField: string): Selection => convertToSelection('max', sqlOrField);

export const avg = (sqlOrField: string): Selection => convertToSelection('avg', sqlOrField);

