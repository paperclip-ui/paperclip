import { StyleDeclaration } from "@paperclip-ui/proto/lib/generated/ast/css";
import { Element } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { EditorState } from "./core";

export type ComputedDeclarationValue = {
  targetExpression: Element;
  raw: string;
  sourceExpression?: StyleDeclaration;
  isInherited?: boolean;

  // default value via window.getComputedStyle?
  isDefault?: boolean;
};

export type SumDeclarationValue = {
  values: ComputedDeclarationValue;
  mixed?: boolean;
  raw: string;
};

export const getSelectedExprStyles = (
  state: EditorState
): Record<string, SumDeclarationValue> => {
  return {};
};
