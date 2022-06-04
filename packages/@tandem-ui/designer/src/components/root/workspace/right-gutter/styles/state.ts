import { memoize } from "tandem-common";
import { PCVariable, PCVariableType } from "paperclip";
import { ColorSwatchOption } from "../../../../inputs/color/color-swatch-controller";

export const mapPCVariablesToColorSwatchOptions = memoize(
  (globalVariables: PCVariable[]): ColorSwatchOption[] => {
    return globalVariables
      .filter((variable) => variable.type === PCVariableType.COLOR)
      .map((variable) => ({
        color: variable.value,
        value: `var(--${variable.id})`,
      }));
  }
);
