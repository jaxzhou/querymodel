
import { SelectQueryBuilder } from "../querybuilder/query_builder";
import { QUERY_META } from "./constants";


export type QueryDefinition = (qb: SelectQueryBuilder) => SelectQueryBuilder;

export const Query = (definition: QueryDefinition, sourceType?: string): ClassDecorator => {
  return (target) => {
    const metaKey = `${QUERY_META}:${sourceType ?? 'default'}`;
    Reflect.defineMetadata(
      metaKey,
      definition,
      target
    );
  };
};

export const getQueryDefinition = (target: Function, sourceType?: string): QueryDefinition |  undefined => {
  const metaKey = `${QUERY_META}:${sourceType ?? 'default'}`;
  const definition: QueryDefinition = Reflect.getMetadata(metaKey, target);
  if (!definition && sourceType !== 'default') {
    return Reflect.getMetadata(`${QUERY_META}:default`, target);
  }
  return definition;
};

