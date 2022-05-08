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
import { cssPropertyChanged, cssPropertyChangeCompleted } from "../../../../../../../actions";
import { dropdownMenuOptionFromValue } from "../../../../../../inputs/dropdown/controller";
const BOX_SIZING_OPTIONS = [
    undefined,
    "border-box",
    "content-box"
].map(dropdownMenuOptionFromValue);
export default (Base) => class SpacingPaneController extends React.PureComponent {
    render() {
        const _a = this.props, { dispatch, computedStyleInfo } = _a, rest = __rest(_a, ["dispatch", "computedStyleInfo"]);
        return (React.createElement(Base, Object.assign({}, rest, { boxSizingInputProps: {
                options: BOX_SIZING_OPTIONS,
                value: computedStyleInfo.style["box-sizing"],
                onChangeComplete: propertyChangeCompleteCallback(dispatch, "box-sizing")
            }, marginInputProps: {
                left: computedStyleInfo.style["margin-left"],
                top: computedStyleInfo.style["margin-top"],
                right: computedStyleInfo.style["margin-right"],
                bottom: computedStyleInfo.style["margin-bottom"],
                onSideChange: sideChangeCallback(dispatch, "margin"),
                onSideChangeComplete: sideChangeCompleteCallback(dispatch, "margin"),
                selectedId: computedStyleInfo.sourceNode.id
            }, paddingInputProps: {
                left: computedStyleInfo.style["padding-left"],
                top: computedStyleInfo.style["padding-top"],
                right: computedStyleInfo.style["padding-right"],
                bottom: computedStyleInfo.style["padding-bottom"],
                onSideChange: sideChangeCallback(dispatch, "padding"),
                selectedId: computedStyleInfo.sourceNode.id,
                onSideChangeComplete: sideChangeCompleteCallback(dispatch, "padding")
            } })));
    }
};
const sideChangeCallback = memoize((dispatch, type) => (side, value) => {
    dispatch(cssPropertyChanged(`${type}-${side}`, value));
});
const propertyChangeCompleteCallback = memoize((dispatch, name) => value => {
    dispatch(cssPropertyChangeCompleted(name, value));
});
const sideChangeCompleteCallback = memoize((dispatch, type) => (side, value) => {
    dispatch(cssPropertyChangeCompleted(`${type}-${side}`, value));
});
//# sourceMappingURL=spacing-2-controller.js.map