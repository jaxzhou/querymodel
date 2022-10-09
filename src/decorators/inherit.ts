import { SelectQueryBuilder } from "../querybuilder";
import { QUERY_META } from "./constants";
import { getQueryDefinition, Query, QueryDefinition } from "./query";

export const Inherit = (queryEntity: any ,definition: QueryDefinition, sourceType?: string): ClassDecorator => {
  return (target) => {
    const superQueryDefinition = getQueryDefinition(queryEntity, sourceType)
    if (!superQueryDefinition) {
      throw new Error('Only Query Module Support Inherit');
    }
    const inheritDefinition: QueryDefinition = (queryBuilder: SelectQueryBuilder) => {
      const superBuilder = superQueryDefinition(queryBuilder);
      return definition(superBuilder);
    };
    Query(inheritDefinition, sourceType)(target);
  }
};