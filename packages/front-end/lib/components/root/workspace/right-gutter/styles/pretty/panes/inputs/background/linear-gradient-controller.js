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
import { stringifyCSSBackground } from "./state";
export default (Base) => class BackgroundGradientPickerController extends React.PureComponent {
    render() {
        const _a = this.props, { value, onChange, onChangeComplete, swatchOptionGroups } = _a, rest = __rest(_a, ["value", "onChange", "onChangeComplete", "swatchOptionGroups"]);
        return (React.createElement(Base, Object.assign({}, rest, { sliderProps: {
                children: [],
                style: {
                    backgroundImage: stringifyCSSBackground(value)
                }
            }, colorPickerProps: {
                value: "rgba(0,0,0,0)",
                onChange,
                onChangeComplete,
                swatchOptionGroups
            } })));
    }
};
//# sourceMappingURL=linear-gradient-controller.js.map