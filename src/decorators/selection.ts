import { isString, union } from "lodash";
import { Selection, select } from "../schema";
import { SELECTION_META } from "./constants";
import { BindTypeTransformer } from "./transformers";

export type SelectOptions = {
  comment?: string;
  source?: string;
};

export const Select = (fieldName: string | Selection, opts?: SelectOptions): PropertyDecorator => {
  return (target, property) => {
    if (!isString(property)) {
      return;
    }
    BindTypeTransformer(target, property);
    const selection: Selection = isString(fieldName) ?  select(fieldName) : fieldName;
    selection.alias = property;
    const source = opts?.source || 'default';
    const SELECTION_META_KEY = `${SELECTION_META}:${source}`;
    const selectKeys: string[] = Reflect.getMetadata(SELECTION_META_KEY, target) || [];
    selectKeys.push(property);
    Reflect.defineMetadata(SELECTION_META_KEY, target, selectKeys);
    Reflect.defineMetadata(SELECTION_META_KEY, selection, target, property);
  };
};



export const getSelectionDefinitions = (
  target: Function,
  source?: string,
): Selection[] => {
  if (!target) {
    return [];
  }
  const selectDefinitions: Selection[] = [];
  let selectKeys: string[] = Reflect.getMetadata(`${SELECTION_META}:default`, target) || [];
  if (source) {
    const sourceKeys: string[] = Reflect.getMetadata(`${SELECTION_META}:${source}`, target) || [];
    selectKeys = union(selectKeys, sourceKeys)
  }
  for (const c of selectKeys) {
    const definition: Selection | undefined = Reflect.getMetadata(`${SELECTION_META}:${source}`, target, c) || Reflect.getMetadata(`${SELECTION_META}:default`, target, c);
    if (definition) {
      selectDefinitions.push(definition);
    }
  }
  const inheritSelection = getSelectionDefinitions(target.prototype, source) || [];
  return selectDefinitions.concat(inheritSelection);
}