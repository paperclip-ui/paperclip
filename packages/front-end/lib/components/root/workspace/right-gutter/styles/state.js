import { memoize } from "tandem-common";
import { PCVariableType } from "paperclip";
export const mapPCVariablesToColorSwatchOptions = memoize((globalVariables) => {
    return globalVariables
        .filter(variable => variable.type === PCVariableType.COLOR)
        .map(variable => ({
        color: variable.value,
        value: `var(--${variable.id})`
    }));
});
//# sourceMappingURL=state.js.map