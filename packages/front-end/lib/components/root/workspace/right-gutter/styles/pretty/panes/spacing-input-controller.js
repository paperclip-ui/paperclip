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
export var Side;
(function (Side) {
    Side["LEFT"] = "left";
    Side["TOP"] = "top";
    Side["RIGHT"] = "right";
    Side["BOTTOM"] = "bottom";
})(Side || (Side = {}));
export default (Base) => class SpacingInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPrimaryChange = value => {
            this.props.onSideChange(Side.LEFT, value);
            this.props.onSideChange(Side.TOP, value);
            this.props.onSideChange(Side.RIGHT, value);
            this.props.onSideChange(Side.BOTTOM, value);
        };
        this.onPrimaryChangeComplete = value => {
            this.props.onSideChangeComplete(Side.LEFT, value);
            this.props.onSideChangeComplete(Side.TOP, value);
            this.props.onSideChangeComplete(Side.RIGHT, value);
            this.props.onSideChangeComplete(Side.BOTTOM, value);
        };
    }
    render() {
        const { onPrimaryChange, onPrimaryChangeComplete } = this;
        const _a = this.props, { onSideChange, selectedId, onSideChangeComplete, left, top, right, bottom } = _a, rest = __rest(_a, ["onSideChange", "selectedId", "onSideChangeComplete", "left", "top", "right", "bottom"]);
        const connected = left === top && left === right && left === bottom;
        return (React.createElement(Base, Object.assign({}, rest, { connected: connected, selectedId: selectedId, primaryInputProps: {
                value: connected ? left : null,
                onChange: onPrimaryChange,
                onChangeComplete: onPrimaryChangeComplete
            }, leftInputProps: {
                value: left,
                onChange: sideChangeCallback(onSideChange, Side.LEFT),
                onChangeComplete: sideChangeCallback(onSideChangeComplete, Side.LEFT)
            }, topInputProps: {
                value: top,
                onChange: sideChangeCallback(onSideChange, Side.TOP),
                onChangeComplete: sideChangeCallback(onSideChangeComplete, Side.TOP)
            }, rightInputProps: {
                value: right,
                onChange: sideChangeCallback(onSideChange, Side.RIGHT),
                onChangeComplete: sideChangeCallback(onSideChangeComplete, Side.RIGHT)
            }, bottomInputProps: {
                value: bottom,
                onChange: sideChangeCallback(onSideChange, Side.BOTTOM),
                onChangeComplete: sideChangeCallback(onSideChangeComplete, Side.BOTTOM)
            } })));
    }
};
const sideChangeCallback = memoize((callback, side) => value => {
    callback(side, value);
});
//# sourceMappingURL=spacing-input-controller.js.map