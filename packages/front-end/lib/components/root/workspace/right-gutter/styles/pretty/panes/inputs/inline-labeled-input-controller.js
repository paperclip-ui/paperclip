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
export default (Base) => class InlineLabeledInputController extends React.PureComponent {
    render() {
        const _a = this.props, { value, tabIndex, disabled, onChange, onChangeComplete } = _a, rest = __rest(_a, ["value", "tabIndex", "disabled", "onChange", "onChangeComplete"]);
        return (React.createElement(Base, Object.assign({}, rest, { textInputProps: {
                disabled,
                tabIndex,
                value,
                onChange,
                onChangeComplete
            } })));
    }
};
//# sourceMappingURL=inline-labeled-input-controller.js.map