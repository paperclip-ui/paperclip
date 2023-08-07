/**
 * Note that we need _another_ serialier for protobufs since the data is structured differently
 * in JavaScript
 */

import { DeclarationValue } from "@paperclip-ui/proto/lib/generated/ast/css";
import { Variant } from "@paperclip-ui/proto/lib/generated/ast/pc";

export type ComputedStyle = {
  value: DeclarationValue;
  ownerId?: string;
  variant?: Variant;
  prevValue?: ComputedStyle;
};

export type ComputedStyleMap = {
  //
  propertyNames: string[];

  // map of computed styles
  map: Record<string, ComputedStyle>;
};

export const serializeDeclaration = (expr: DeclarationValue) => {
  if (expr.arithmetic) {
    return `${serializeDeclaration(expr.arithmetic.left)} ${
      expr.arithmetic.operator
    } ${serializeDeclaration(expr.arithmetic.right)}`;
  }
  if (expr.commaList) {
    return expr.commaList.items
      .map((expr) => serializeDeclaration(expr))
      .join(", ");
  }
  if (expr.functionCall) {
    return `${expr.functionCall.name}(${serializeDeclaration(
      expr.functionCall.arguments
    )})`;
  }
  if (expr.hexColor) {
    return `#${expr.hexColor.value}`;
  }
  if (expr.measurement) {
    return `${expr.measurement.value}${expr.measurement.unit}`;
  }
  if (expr.number) {
    return `${expr.number.value}`;
  }
  if (expr.reference) {
    return `${expr.reference.path.join(".")}`;
  }
  if (expr.spacedList) {
    return expr.spacedList.items
      .map((expr) => serializeDeclaration(expr))
      .join(" ");
  }
  if (expr.str) {
    return `"${expr.str.value}"`;
  }
};

export const serializeComputedStyle = (
  style: ComputedStyleMap
): Record<string, string> => {
  const comp = {};
  for (const key in style.map) {
    comp[key] = serializeDeclaration(style[key]);
  }
  return comp;
};
