import { isString } from "lodash";
import { Type, Transform } from "class-transformer";
import { count, sum, avg, Selection, min, max, select } from "../schema";
import { SELECTION_META } from "./constants";
import { BindTypeTransformer } from "./transformers";

export type SelectOptions = {
  comment?: string;
  source?: string;
};

export const Select = (fieldName: string, opts?: SelectOptions): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const selection: Selection = select(fieldName);
    if (!('column' in selection && selection.column === property && !('agg' in selection))) {
      selection.alias = property;
    }
    Reflect.defineMetadata(
      SELECTION_META,
      selection,
      target,
      property
    );
    const selectionProperty = opts?.source ? `selection:${opts.source}:${property}` : `selection:${property}`;
    Reflect.set(target.constructor, selectionProperty, selection);
  };
};

export const Raw = (rawSting: string, opts?: SelectOptions): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const selection: Selection = select(rawSting);
    selection.alias = property;
    Reflect.defineMetadata(
      SELECTION_META,
      selection,
      target,
      property
    );
    const selectionProperty = opts?.source ? `selection:${opts.source}:${property}` : `selection:${property}`;
    Reflect.set(target.constructor, selectionProperty, selection);
  };
};

export const Count = (fieldName: string, opts?: SelectOptions): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const selection = count(fieldName);
    selection.alias = property;
    Reflect.defineMetadata(
      SELECTION_META,
      selection,
      target,
      property
    );
    const selectionProperty = opts?.source ? `selection:${opts.source}:${property}` : `selection:${property}`;
    Reflect.set(target.constructor, selectionProperty, selection);
  };
};

export const Sum = (fieldName: string, opts?: SelectOptions): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const selection = sum(fieldName);
    selection.alias = property;
    Reflect.defineMetadata(
      SELECTION_META,
      selection,
      target,
      property
    );
    const selectionProperty = opts?.source ? `selection:${opts.source}:${property}` : `selection:${property}`;
    Reflect.set(target.constructor, selectionProperty, selection);
  };
};

export const Avg = (fieldName: string, opts?: SelectOptions): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const selection = avg(fieldName);
    selection.alias = property;
    Reflect.defineMetadata(
      SELECTION_META,
      selection,
      target,
      property
    );
    const selectionProperty = opts?.source ? `selection:${opts.source}:${property}` : `selection:${property}`;
    Reflect.set(target.constructor, selectionProperty, selection);
  };
};

export const Min = (fieldName: string, opts?: SelectOptions): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const select = min(fieldName);
    select.alias = property;
    Reflect.defineMetadata(
      SELECTION_META,
      select,
      target,
      property
    );
    const selectionProperty = opts?.source ? `selection:${opts.source}:${property}` : `selection:${property}`;
    Reflect.set(target.constructor, selectionProperty, select);
  };
};

export const Max = (fieldName: string, opts?: SelectOptions): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const selection = max(fieldName);
    selection.alias = property;
    Reflect.defineMetadata(
      SELECTION_META,
      selection,
      target,
      property
    );
    const selectionProperty = opts?.source ? `selection:${opts.source}:${property}` : `selection:${property}`;
    Reflect.set(target.constructor, selectionProperty, selection);
  };
};

export const getSelectionDefinitions = (
  target: Object,
  source?: string,
): Selection[] => {
  const properties = Object.getOwnPropertyNames(target);
  return properties
    .filter(p => {
      if (!p.startsWith('selection:')) {
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
    .map(property => {
      return Reflect.get(target, property);
    });
};