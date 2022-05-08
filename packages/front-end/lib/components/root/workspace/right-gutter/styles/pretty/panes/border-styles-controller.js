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
import { memoize } from "tandem-common";
const { EmptySquareIcon, BordersIcon3 } = require("../../../../../../../icons/view.pc");
var TOGGLE_OPTION;
(function (TOGGLE_OPTION) {
    TOGGLE_OPTION[TOGGLE_OPTION["ALL"] = 0] = "ALL";
    TOGGLE_OPTION[TOGGLE_OPTION["INDIVIDUAL"] = 1] = "INDIVIDUAL";
})(TOGGLE_OPTION || (TOGGLE_OPTION = {}));
const TOGGLE_OPTIONS = [
    {
        icon: React.createElement(EmptySquareIcon, { style: { height: "9px", width: "9px" } }),
        value: TOGGLE_OPTION.ALL
    },
    {
        icon: React.createElement(BordersIcon3, { style: { height: "9px", width: "9px" } }),
        value: TOGGLE_OPTION.INDIVIDUAL
    }
];
export default (Base) => class BorderStylesController extends React.PureComponent {
    constructor(props) {
        super(props);
        this.setBorderStyling = (value) => {
            this.setState(Object.assign(Object.assign({}, this.state), { borderStyling: value }));
        };
        this.onStyleToggleChangeComplete = value => {
            this.setBorderStyling(value);
        };
        const { computedStyleInfo } = props;
        this.state = {
            borderStyling: computedStyleInfo.style["border-left"] ||
                computedStyleInfo.style["border-right"] ||
                computedStyleInfo.style["border-top"] ||
                computedStyleInfo.style["border-bottom"]
                ? TOGGLE_OPTION.INDIVIDUAL
                : TOGGLE_OPTION.ALL
        };
    }
    render() {
        const _a = this.props, { documentColors, onPropertyChange, onPropertyChangeComplete, computedStyleInfo, globalVariables } = _a, rest = __rest(_a, ["documentColors", "onPropertyChange", "onPropertyChangeComplete", "computedStyleInfo", "globalVariables"]);
        const { borderStyling } = this.state;
        const { onStyleToggleChangeComplete } = this;
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                all: borderStyling === TOGGLE_OPTION.ALL,
                individual: borderStyling === TOGGLE_OPTION.INDIVIDUAL
            }), togglerProps: {
                value: borderStyling,
                options: TOGGLE_OPTIONS,
                onChangeComplete: onStyleToggleChangeComplete
            }, borderInputProps: {
                documentColors,
                globalVariables,
                value: computedStyleInfo.style.border,
                onChange: propertyChangeCallback("border", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border", onPropertyChangeComplete)
            }, borderLeftInputProps: {
                documentColors,
                globalVariables,
                value: computedStyleInfo.style["border-left"],
                onChange: propertyChangeCallback("border-left", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-left", onPropertyChangeComplete)
            }, borderRightInputProps: {
                documentColors,
                globalVariables,
                value: computedStyleInfo.style["border-right"],
                onChange: propertyChangeCallback("border-right", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-right", onPropertyChangeComplete)
            }, borderTopInputProps: {
                documentColors,
                globalVariables,
                value: computedStyleInfo.style["border-top"],
                onChange: propertyChangeCallback("border-top", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-top", onPropertyChangeComplete)
            }, borderBottomInputProps: {
                documentColors,
                globalVariables,
                value: computedStyleInfo.style["border-bottom"],
                onChange: propertyChangeCallback("border-bottom", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-bottom", onPropertyChangeComplete)
            } })));
    }
};
const propertyChangeCallback = memoize((name, listener) => value => listener(name, value));
//# sourceMappingURL=border-styles-controller.js.map