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
import { EMPTY_ARRAY } from "tandem-common";
import { ColorPicker } from "./picker.pc";
import { maybeConvertSwatchValueToColor } from "./color-swatch-controller";
export default (Base) => class ColorInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = { open: false };
        this.onButtonClick = () => {
            this.setState(Object.assign(Object.assign({}, this.state), { open: !this.state.open }));
        };
        this.onShouldClose = () => {
            this.setState(Object.assign(Object.assign({}, this.state), { open: false }));
        };
    }
    render() {
        let popdownChildren = EMPTY_ARRAY;
        const { open } = this.state;
        const _a = this.props, { value, onChange, swatchOptionGroups, onChangeComplete, renderColorPicker } = _a, rest = __rest(_a, ["value", "onChange", "swatchOptionGroups", "onChangeComplete", "renderColorPicker"]);
        const { onButtonClick, onShouldClose } = this;
        if (open) {
            popdownChildren = renderColorPicker ? (renderColorPicker({
                value: value || "#FF0000",
                onChange,
                onChangeComplete,
                swatchOptionGroups
            })) : (React.createElement(ColorPicker, { value: value || "#FF0000", onChange: onChange, onChangeComplete: onChangeComplete, swatchOptionGroups: swatchOptionGroups }));
        }
        return (React.createElement(Base, Object.assign({}, rest, { buttonProps: {
                tabIndex: 0,
                onClick: onButtonClick,
                style: {
                    background: maybeConvertSwatchValueToColor(value, swatchOptionGroups) ||
                        "transparent",
                    backgroundSize: "cover",
                    backgroundRepeat: "no-repeat"
                }
            }, popoverProps: {
                open,
                onShouldClose
            }, content: popdownChildren })));
    }
};
//# sourceMappingURL=color-input-controller.js.map