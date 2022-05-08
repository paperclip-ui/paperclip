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
import { getPrettyPaneColorSwatchOptionGroups } from "./utils";
export default (Base) => class BoxShadowItemController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onColorChange = color => {
            const { value, onChange } = this.props;
            onChange(Object.assign(Object.assign({}, value), { color }));
        };
        this.onColorChangeComplete = color => {
            const { value, onChangeComplete } = this.props;
            onChangeComplete(Object.assign(Object.assign({}, value), { color }));
        };
        this.onXChange = x => {
            const { value, onChange } = this.props;
            onChange(Object.assign(Object.assign({}, value), { x }));
        };
        this.onXChangeComplete = x => {
            const { value, onChangeComplete } = this.props;
            onChangeComplete(Object.assign(Object.assign({}, value), { x }));
        };
        this.onYChange = y => {
            const { value, onChange } = this.props;
            onChange(Object.assign(Object.assign({}, value), { y }));
        };
        this.onYChangeComplete = y => {
            const { value, onChangeComplete } = this.props;
            onChangeComplete(Object.assign(Object.assign({}, value), { y }));
        };
        this.onBlurChange = blur => {
            const { value, onChange } = this.props;
            onChange(Object.assign(Object.assign({}, value), { blur }));
        };
        this.onBlurChangeComplete = blur => {
            const { value, onChangeComplete } = this.props;
            onChangeComplete(Object.assign(Object.assign({}, value), { blur }));
        };
        this.onSpreadChange = spread => {
            const { value, onChange } = this.props;
            onChange(Object.assign(Object.assign({}, value), { spread }));
        };
        this.onSpreadChangeComplete = spread => {
            const { value, onChangeComplete } = this.props;
            onChangeComplete(Object.assign(Object.assign({}, value), { spread }));
        };
    }
    render() {
        const _a = this.props, { value: { color, x, y, blur, spread }, selected, documentColors, onChange, onChangeComplete, onBackgroundClick, globalVariables, onRemove } = _a, rest = __rest(_a, ["value", "selected", "documentColors", "onChange", "onChangeComplete", "onBackgroundClick", "globalVariables", "onRemove"]);
        const { onColorChange, onColorChangeComplete, onXChange, onXChangeComplete, onYChange, onYChangeComplete, onBlurChange, onBlurChangeComplete, onSpreadChange, onSpreadChangeComplete } = this;
        return (React.createElement(Base, Object.assign({}, rest, { variant: cx({ selected }), removeButtonProps: {
                onClick: onRemove
            }, colorInputProps: {
                value: color,
                swatchOptionGroups: getPrettyPaneColorSwatchOptionGroups(documentColors, globalVariables),
                onClick: stopPropagation,
                onChange: onColorChange,
                onChangeComplete: onColorChangeComplete
            }, xInputProps: {
                value: x,
                onClick: stopPropagation,
                onChange: onXChange,
                onChangeComplete: onXChangeComplete
            }, yInputProps: {
                value: y,
                onClick: stopPropagation,
                onChange: onYChange,
                onChangeComplete: onYChangeComplete
            }, blurInputProps: {
                value: blur,
                onClick: stopPropagation,
                onChange: onBlurChange,
                onChangeComplete: onBlurChangeComplete
            }, spreadInputProps: {
                value: spread,
                onClick: stopPropagation,
                onChange: onSpreadChange,
                onChangeComplete: onSpreadChangeComplete
            } })));
    }
};
const stopPropagation = event => event.stopPropagation();
//# sourceMappingURL=box-shadow-item-controller.js.map