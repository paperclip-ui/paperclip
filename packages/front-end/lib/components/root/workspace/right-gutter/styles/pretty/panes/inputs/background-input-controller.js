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
import { BackgroundPicker } from "./background/view.pc";
import { stringifyCSSBackground } from "./background/state";
export default (Base) => class BackgroundInputController extends React.PureComponent {
    render() {
        const _a = this.props, { value, cwd } = _a, rest = __rest(_a, ["value", "cwd"]);
        return (React.createElement(Base, Object.assign({ value: stringifyCSSBackground(value) }, rest, { backgroundPickerProps: null, renderColorPicker: props => (React.createElement(BackgroundPicker, Object.assign({}, props, { cwd: cwd, value: value }))) })));
    }
};
//# sourceMappingURL=background-input-controller.js.map