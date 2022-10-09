import { isString } from "lodash";
import { COLUMN_META } from "./constants";
import { BindTypeTransformer } from "./transformers";

export type ColumnOptions = {
  primary?: boolean;
  nullable?: boolean;
  length?: number;
  comment?: string;
  source?: string;
};

export type ColumDefinition = {
  type: string;
  name: string;
  primary: boolean;
  nullable: boolean;
  length?: number;
  comment?: string;
};

export const Column = (
  type: string,
  opts?: ColumnOptions
): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const defaultDefinition: ColumDefinition = {
      type,
      name: property.toString(),
      primary: false,
      nullable: true,
    };
    const definition = {
      ...defaultDefinition,
      ...opts,
    };
    const propertyName = opts?.source ? `column:${opts.source}:${property}` : `column:${property}`;
    Reflect.defineMetadata(COLUMN_META, definition, target.constructor, property);
    Reflect.set(target.constructor, propertyName, definition);
  };
};

export const getColumnDefinition = (
  target: Object,
  property: string | symbol
): ColumDefinition => {
  const definition: ColumDefinition = Reflect.getMetadata(
    COLUMN_META,
    target.constructor,
    property
  );
  return definition;
};

export const getColumnDefinitions = (
  target: Function,
  source?: string,
): ColumDefinition[] => {
  if (!target) {
    return [];
  }
  const properties = Object.getOwnPropertyNames(target) || [];
  const extendColumns = getColumnDefinitions(Object.getPrototypeOf(target), source) || [];
  const ownColumns = properties
    .filter(p => {
      if (!p.startsWith('column:')) {
        return false;
      }
      const names = p.split(':');
      if (source) {
        if (names.length > 2) {
          return names[1] === source;
        }
        const exists = properties.find(a => {
          const compos = a.split(':');
          if (compos.length > 2) {
            return compos[2] === names[1] && compos[1] === source;
          }
          return false;
        });
        if (exists) {
          return false;
        }
      }
      return true;
    })
    .map(property => Reflect.get(
      target,
      property
    ));
  return ownColumns.concat(extendColumns);
};