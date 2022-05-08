var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import { VariableRowItem } from "./view.pc";
import { addVariableButtonClicked } from "../../../../../actions";
import { PCVariableType } from "paperclip";
const TYPE_OPTIONS = [
    // PCVariableType.NUMBER,
    PCVariableType.COLOR,
    PCVariableType.TEXT
    // PCVariableType.FONT
    // TODO
    // "Alias"
]
    .map(value => ({
    label: value.substr(0, 1).toUpperCase() + value.substr(1),
    value
}))
    .filter(Boolean);
export default (Base) => class VariablesInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onVariableButtonClick = type => {
            this.props.dispatch(addVariableButtonClicked(type));
        };
    }
    render() {
        const { onVariableButtonClick } = this;
        const _a = this.props, { dispatch, globalVariables, show, fontFamilies } = _a, rest = __rest(_a, ["dispatch", "globalVariables", "show", "fontFamilies"]);
        const items = globalVariables.map((variable, i) => {
            return (React.createElement(VariableRowItem, { key: variable.id, alt: Boolean(i % 2), variable: variable, fontFamilies: fontFamilies, dispatch: dispatch }));
        });
        return (React.createElement(Base, Object.assign({}, rest, { addVariableButtonProps: {
                options: TYPE_OPTIONS,
                onChange: onVariableButtonClick
            }, items: items })));
    }
};
//# sourceMappingURL=controller.js.map