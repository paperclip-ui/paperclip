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
import { memoize } from "tandem-common";
export default (Base) => class BorderColorInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPrimaryChange = (value) => {
            this.props.onPropertyChange("border-left", value);
            this.props.onPropertyChange("border-top", value);
            this.props.onPropertyChange("border-right", value);
            this.props.onPropertyChange("border-bottom", value);
        };
        this.onPrimaryChangeComplete = (value) => {
            this.props.onPropertyChangeComplete("border-left", value);
            this.props.onPropertyChangeComplete("border-top", value);
            this.props.onPropertyChangeComplete("border-right", value);
            this.props.onPropertyChangeComplete("border-bottom", value);
        };
    }
    render() {
        const { onPrimaryChange, onPrimaryChangeComplete } = this;
        const _a = this.props, { documentColors, onPropertyChange, onPropertyChangeComplete, globalVariables, computedStyleInfo } = _a, rest = __rest(_a, ["documentColors", "onPropertyChange", "onPropertyChangeComplete", "globalVariables", "computedStyleInfo"]);
        const connected = computedStyleInfo.style["border-left"] ===
            computedStyleInfo.style["border-top"] &&
            computedStyleInfo.style["border-left"] ===
                computedStyleInfo.style["border-right"] &&
            computedStyleInfo.style["border-left"] ===
                computedStyleInfo.style["border-bottom"];
        return (React.createElement(Base, Object.assign({}, rest, { connected: connected, selectedId: computedStyleInfo.sourceNode.id, primaryInputProps: {
                value: connected ? computedStyleInfo.style["border-left"] : null,
                documentColors,
                globalVariables,
                onChange: onPrimaryChange,
                onChangeComplete: onPrimaryChangeComplete
            }, topInputProps: {
                value: computedStyleInfo.style["border-top"],
                documentColors,
                globalVariables,
                onChange: propertyChangeCallback("border-top", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-top", onPropertyChangeComplete)
            }, bottomInputProps: {
                value: computedStyleInfo.style["border-bottom"],
                documentColors,
                globalVariables,
                onChange: propertyChangeCallback("border-bottom", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-bottom", onPropertyChangeComplete)
            }, leftInputProps: {
                value: computedStyleInfo.style["border-left"],
                documentColors,
                globalVariables,
                onChange: propertyChangeCallback("border-left", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-left", onPropertyChangeComplete)
            }, rightInputProps: {
                value: computedStyleInfo.style["border-right"],
                documentColors,
                globalVariables,
                onChange: propertyChangeCallback("border-right", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-right", onPropertyChangeComplete)
            } })));
    }
};
const propertyChangeCallback = memoize((name, listener) => value => listener(name, value));
//# sourceMappingURL=border-color-input-controller.js.map