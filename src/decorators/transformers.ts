import { TransformFnParams,Type, Transform} from "class-transformer";
import { get, isBuffer, isPlainObject, isString, values } from "lodash";

export const ArrayTransformer = (v:TransformFnParams) => {
  let values = v.value;
  if (!values) {
    return values;
  }
  if (isString(v.value)) {
    values = JSON.parse(v.value);
  }
  if (isBuffer(values) || (isPlainObject(values) && get(values, 'type') === 'Buffer')) {
    values = JSON.parse(Buffer.from(values).toString());
  }
  return [...values];
}

export const BindTypeTransformer = (target: any, property: string) => {
  const exluedTypes = [String, Boolean, Array];
  const proertyType = Reflect.getMetadata("design:type", target, property);
  if (proertyType && !exluedTypes.includes(proertyType)) {
    Type(() => proertyType)(target, property);
  }
  if (proertyType === Array) {
    Transform(ArrayTransformer)(target, property);
  }
}