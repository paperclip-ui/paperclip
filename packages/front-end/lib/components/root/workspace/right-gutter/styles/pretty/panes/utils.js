import { memoize } from "tandem-common";
export const mapVariablesToCSSVarDropdownOptions = (variables) => variables.map(variable => ({
    value: `var(--${variable.id})`,
    label: variable.label,
    special: true
}));
export const getPrettyPaneColorSwatchOptionGroups = memoize((documentColors, globalVariables) => {
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
});
//# sourceMappingURL=utils.js.map