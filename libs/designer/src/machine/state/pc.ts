import { ast } from "@paperclip-ui/proto/lib/ast/pc-utils";
import { EditorState } from "./core";

export const MIXED_VALUE = "mixed";

export type ComputedDeclaration = {
  value: string;
  isExplicitlyDefined: boolean;
};

const COLLAPSED_PROPS = {
  "border-left-width": ["border", "border-width"],
  "border-top-width": ["border", "border-width"],
};

export const getSelectedExprStyles = (
  state: EditorState
): Record<string, ComputedDeclaration> => {
  const combinedStyles: Record<string, ComputedDeclaration> = {};

  for (const virtId of state.selectedVirtNodeIds) {
    const expr = ast.getExprByVirtId(virtId, state.graph);
    const exprStyle = ast.computeElementStyle(virtId, state.graph);
    console.log("EXP STYLE", exprStyle);
    const computedStyle = state.computedStyles[virtId];
    for (const name in computedStyle) {
      const value = computedStyle[name];
      if (
        combinedStyles[name] != null &&
        combinedStyles[name].value !== value
      ) {
        combinedStyles[name].value = MIXED_VALUE;
      } else {
        combinedStyles[name] = {
          isExplicitlyDefined: Boolean(
            exprStyle[name] != null ||
              COLLAPSED_PROPS[name]?.some((alias) => {
                return exprStyle[alias];
              })
          ),
          value: computedStyle[name],
        };
      }
    }
  }

  return combinedStyles;
};
