import { TABLE_META } from "./constants";

export type EntityOptions = {
  schema?: string;
  description?: string;
  source?: string;
};
export type TableDefinition = {
  name: string;
  schema?: string;
};
export const Entity = (name: string, opts?: EntityOptions): ClassDecorator => {
  return (target) => {
    const metaKey = `${TABLE_META}:${opts?.source || 'default'}`
    Reflect.defineMetadata(
      metaKey,
      {
        name,
        ...opts,
      },
      target
    );
  };
};

export const getTableDefinition = (target: Function, source: string = 'default'): TableDefinition | undefined => {
  const metaKey = `${TABLE_META}:${source}`
  const definition: TableDefinition = Reflect.getMetadata(metaKey, target);
  if (!definition && source !== 'default') {
    const definition: TableDefinition = Reflect.getMetadata(`${TABLE_META}:default`, target);
    return definition;
  }
  return definition;
};
