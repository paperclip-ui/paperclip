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
import { CornersIcon, RoundSquareIcon } from "../../../../../../../icons/view.pc";
const CONNECTED_ICON = (React.createElement(RoundSquareIcon, { style: { height: "12px", width: "12px" } }));
const DISCONNECTED_ICON = (React.createElement(CornersIcon, { style: { height: "12px", width: "12px" } }));
export default (Base) => class RadiusInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPrimaryChange = (value) => {
            this.props.onPropertyChange("border-top-left-radius", value);
            this.props.onPropertyChange("border-top-right-radius", value);
            this.props.onPropertyChange("border-bottom-left-radius", value);
            this.props.onPropertyChange("border-bottom-right-radius", value);
        };
        this.onPrimaryChangeComplete = (value) => {
            this.props.onPropertyChangeComplete("border-top-left-radius", value);
            this.props.onPropertyChangeComplete("border-top-right-radius", value);
            this.props.onPropertyChangeComplete("border-bottom-left-radius", value);
            this.props.onPropertyChangeComplete("border-bottom-right-radius", value);
        };
    }
    render() {
        const { onPrimaryChange, onPrimaryChangeComplete } = this;
        const _a = this.props, { computedStyleInfo, onPropertyChange, onPropertyChangeComplete } = _a, rest = __rest(_a, ["computedStyleInfo", "onPropertyChange", "onPropertyChangeComplete"]);
        const connected = computedStyleInfo.style["border-top-left-radius"] ===
            computedStyleInfo.style["border-top-right-radius"] &&
            computedStyleInfo.style["border-top-left-radius"] ===
                computedStyleInfo.style["border-bottom-left-radius"] &&
            computedStyleInfo.style["border-top-left-radius"] ===
                computedStyleInfo.style["border-bottom-right-radius"];
        return (React.createElement(Base, Object.assign({}, rest, { connected: connected, selectedId: computedStyleInfo.sourceNode.id, connectedIcon: CONNECTED_ICON, disconnectedIcon: DISCONNECTED_ICON, primaryInputProps: {
                value: connected
                    ? computedStyleInfo.style["border-top-left-radius"]
                    : null,
                onChange: onPrimaryChange,
                onChangeComplete: onPrimaryChangeComplete
            }, topLeftInputProps: {
                value: computedStyleInfo.style["border-top-left-radius"],
                onChange: propertyChangeCallback("border-top-left-radius", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-top-left-radius", onPropertyChangeComplete)
            }, topRightInputProps: {
                value: computedStyleInfo.style["border-top-right-radius"],
                onChange: propertyChangeCallback("border-top-right-radius", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-top-right-radius", onPropertyChangeComplete)
            }, bottomLeftInputProps: {
                value: computedStyleInfo.style["border-bottom-left-radius"],
                onChange: propertyChangeCallback("border-bottom-left-radius", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-bottom-left-radius", onPropertyChangeComplete)
            }, bottomRightInputProps: {
                value: computedStyleInfo.style["border-bottom-right-radius"],
                onChange: propertyChangeCallback("border-bottom-right-radius", onPropertyChange),
                onChangeComplete: propertyChangeCallback("border-bottom-right-radius", onPropertyChangeComplete)
            } })));
    }
};
const propertyChangeCallback = memoize((name, listener) => value => listener(name, value));
//# sourceMappingURL=radius-controller.js.map