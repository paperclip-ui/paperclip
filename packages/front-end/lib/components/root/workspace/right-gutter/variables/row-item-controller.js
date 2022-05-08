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
import cx from "classnames";
import { PCVariableType } from "paperclip";
import { variableLabelChangeCompleted, variableValueChanged, variableValueChangeCompleted } from "../../../../../actions";
import { EMPTY_ARRAY } from "tandem-common";
import { getFontFamilyOptions } from "../styles/pretty/panes/typography-controller";
export default (Base) => class VariableRowItemController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onValueChange = value => {
            this.props.dispatch(variableValueChanged(this.props.variable, value));
        };
        this.onValueChangeComplete = value => {
            this.props.dispatch(variableValueChangeCompleted(this.props.variable, value));
        };
        this.onLabelChangeComplete = value => {
            this.props.dispatch(variableLabelChangeCompleted(this.props.variable, value));
        };
    }
    render() {
        const { onValueChange, onValueChangeComplete, onLabelChangeComplete } = this;
        const _a = this.props, { variable, fontFamilies, alt } = _a, rest = __rest(_a, ["variable", "fontFamilies", "alt"]);
        const limited = variable.type === PCVariableType.FONT;
        const color = variable.type === PCVariableType.COLOR;
        const unlimited = variable.type === PCVariableType.NUMBER ||
            variable.type === PCVariableType.UNIT ||
            variable.type === PCVariableType.TEXT;
        let limitedOptions = EMPTY_ARRAY;
        if (variable.type === PCVariableType.FONT) {
            limitedOptions = getFontFamilyOptions(fontFamilies);
        }
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                alt,
                unlimited,
                limited,
                color
            }), limitedInputProps: {
                options: limitedOptions,
                onChange: onValueChange,
                onChangeComplete: onValueChangeComplete,
                value: variable.value
            }, unlimitedInputProps: {
                onChange: onValueChange,
                onChangeComplete: onValueChangeComplete,
                value: variable.value
            }, nameInputProps: {
                focus: !variable.label,
                onChangeComplete: onLabelChangeComplete,
                value: variable.label
            }, colorInputProps: {
                swatchOptionGroups: EMPTY_ARRAY,
                onChange: onValueChange,
                onChangeComplete: onValueChangeComplete,
                value: variable.value
            } })));
    }
};
//# sourceMappingURL=row-item-controller.js.map