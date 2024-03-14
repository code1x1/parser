import { namedTypes, builders as b } from "ast-types";

export function getValue(
  typeAnnotation: unknown
):
  | namedTypes.StringLiteral
  | namedTypes.NumericLiteral
  | namedTypes.BooleanLiteral
  | namedTypes.NullLiteral
  | namedTypes.ArrayExpression {
  if (namedTypes.TSBooleanKeyword.check(typeAnnotation)) {
    return b.booleanLiteral(false);
  }
  if (namedTypes.TSNumberKeyword.check(typeAnnotation)) {
    return b.numericLiteral(0);
  }
  if (namedTypes.TSStringKeyword.check(typeAnnotation)) {
    return b.stringLiteral("");
  }
  if (namedTypes.TSTypeReference.check(typeAnnotation)) {
    return b.stringLiteral(typeAnnotation.typeName.type);
  }
  if (namedTypes.TSArrayType.check(typeAnnotation)) {
    return b.arrayExpression([getValue(typeAnnotation.elementType)]);
  }
  return b.nullLiteral();
}
