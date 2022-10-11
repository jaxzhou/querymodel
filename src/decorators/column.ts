import { isString, union } from "lodash";
import { COLUMN_META } from "./constants";
import { BindTypeTransformer } from "./transformers";

export type ColumnOptions = {
  type?: string;
  source?: string;
};

export type ColumDefinition = {
  name: string;
  alias: string;
  type?: string;
  comment?: string;
};

type ColumnDecorator = (( name?: string ) => PropertyDecorator) | (( opts?: ColumnOptions ) => PropertyDecorator)| (( name?: string, opts?: ColumnOptions ) => PropertyDecorator);

export const Column: ColumnDecorator = ( name?: string | ColumnOptions, opts?: ColumnOptions ): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    let definition: ColumDefinition = {
      name: property,
      alias: property,
    };
    let columnOpts: ColumnOptions = opts || {};
    if (isString(name)) {
      definition.name = name;
    } else if (name) {
      columnOpts = name;
    }
    definition = {
      ...definition,
      ...columnOpts,
    }
    BindTypeTransformer(target, property);
    const source = columnOpts.source || 'default';
    const COLUMN_META_KEY = `${COLUMN_META}:${source}`;
    const columns: string[] = Reflect.getMetadata(COLUMN_META_KEY, target) || [];
    columns.push(property);
    Reflect.defineMetadata(COLUMN_META_KEY, target, columns);
    Reflect.defineMetadata(COLUMN_META_KEY, definition, target.constructor, property);
  };
};

export const getColumnDefinitions = (
  target: Function,
  source?: string,
): ColumDefinition[] => {
  if (!target) {
    return [];
  }
  const columnDefinitions: ColumDefinition[] = [];
  let columns: string[] = Reflect.getMetadata(`${COLUMN_META}:default`, target) || [];
  if (source) {
    const sourceColumns: string[] = Reflect.getMetadata(`${COLUMN_META}:${source}`, target) || [];
    columns = union(columns, sourceColumns)
  }
  for (const c of columns) {
    const definition: ColumDefinition | undefined = Reflect.getMetadata(`${COLUMN_META}:${source}`, target, c) || Reflect.getMetadata(`${COLUMN_META}:default`, target, c);
    if (definition) {
      columnDefinitions.push(definition);
    }
  }
  const inheritColumns = getColumnDefinitions(target.prototype, source) || [];
  return columnDefinitions.concat(inheritColumns);
};