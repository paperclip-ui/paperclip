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
import cx from "classnames";
export default (Base) => class BackgroundPickerController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            backgroundType: this.props.value.type
        };
        this.onTypeClick = (backgroundType) => {
            this.setState({ backgroundType });
        };
    }
    static getDerivedStateFromProps(nextProps, prevState) {
        let newState = prevState;
        if (nextProps.value.type !== prevState._backgroundType) {
            newState = Object.assign(Object.assign({}, prevState), { backgroundType: nextProps.value.type, _backgroundType: nextProps.value.type });
        }
        return newState === prevState ? prevState : null;
    }
    render() {
        const _a = this.props, { cwd, value, onChange, onChangeComplete, swatchOptionGroups } = _a, rest = __rest(_a, ["cwd", "value", "onChange", "onChangeComplete", "swatchOptionGroups"]);
        const { backgroundType } = this.state;
        const { onTypeClick } = this;
        if (!value) {
            return value;
        }
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({
                solid: backgroundType === CSSBackgroundType.SOLID,
                linearGradient: backgroundType === CSSBackgroundType.LINEAR_GRADIENT,
                image: backgroundType === CSSBackgroundType.IMAGE
            }), solidToggleButtonProps: {
                onClick: () => onTypeClick(CSSBackgroundType.SOLID)
            }, linearGradientButtonProps: {
                onClick: () => onTypeClick(CSSBackgroundType.LINEAR_GRADIENT)
            }, imageToggleButtonProps: {
                onClick: () => onTypeClick(CSSBackgroundType.IMAGE)
            }, solidColorPickerProps: {
                value: value,
                onChange,
                onChangeComplete,
                swatchOptionGroups
            }, linearGradientPickerProps: {
                value: value,
                onChange,
                onChangeComplete,
                swatchOptionGroups
            }, backgroundImagePickerProps: {
                cwd,
                value: value,
                onChange,
                onChangeComplete
            } })));
    }
};
//# sourceMappingURL=controller.js.map