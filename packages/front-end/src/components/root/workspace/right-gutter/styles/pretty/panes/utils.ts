import { PCVariable } from "paperclip";
import { DropdownMenuOption } from "../../../../../../inputs/dropdown/controller";
import { ColorSwatchGroup } from "../../../../../../inputs/color/color-swatch-controller";
import { memoize } from "tandem-common";

export const mapVariablesToCSSVarDropdownOptions = (
  variables: PCVariable[]
): DropdownMenuOption[] =>
  variables.map(variable => ({
    value: `var(--${variable.id})`,
    label: variable.label,
    special: true
  }));

export const getPrettyPaneColorSwatchOptionGroups = memoize(
  (
    documentColors: string[],
    globalVariables: PCVariable[]
  ): ColorSwatchGroup[] => {
    return [
      documentColors.length
        ? {
            label: "Document Colors",
            options: documentColors.map(color => ({
              color,
              value: color
            }))
          }
        : null,
      globalVariables.length
        ? {
            label: "Global Colors",
            options: globalVariables.map(variable => ({
              color: variable.value,
              value: `var(--${variable.id})`
            }))
          }
        : null
    ].filter(Boolean);
  }
);
