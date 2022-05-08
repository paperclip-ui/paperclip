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
import { CSSBackgroundType } from "./state";
export default (Base) => class BackgroundPickerController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChange = (color) => {
            this.props.onChange({
                type: CSSBackgroundType.SOLID,
                color
            });
        };
        this.onChangeComplete = (color) => {
            this.props.onChangeComplete({
                type: CSSBackgroundType.SOLID,
                color
            });
        };
    }
    render() {
        const { onChange, onChangeComplete } = this;
        const _a = this.props, { value, swatchOptionGroups } = _a, rest = __rest(_a, ["value", "swatchOptionGroups"]);
        return (React.createElement(Base, Object.assign({}, rest, { colorPickerProps: {
                value: value.color || "rgba(0,0,0,1)",
                onChange,
                onChangeComplete,
                swatchOptionGroups
            } })));
    }
};
//# sourceMappingURL=solid-controller.js.map