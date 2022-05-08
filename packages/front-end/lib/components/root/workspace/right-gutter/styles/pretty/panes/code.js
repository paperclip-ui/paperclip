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
import { stringifyStyle, EMPTY_OBJECT } from "tandem-common";
import { rawCssTextChanged } from "../../../../../../../actions";
export default (Base) => class CodeController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChange = value => {
            this.props.dispatch(rawCssTextChanged(value));
        };
    }
    render() {
        const { onChange } = this;
        const _a = this.props, { computedStyleInfo } = _a, rest = __rest(_a, ["computedStyleInfo"]);
        const cssText = getSelectedNodeStyle(computedStyleInfo);
        return (React.createElement(Base, Object.assign({}, rest, { textareaProps: {
                value: cssText,
                onChange
            } })));
    }
};
const getSelectedNodeStyle = (info) => {
    return (info &&
        stringifyStyle(info.style || EMPTY_OBJECT)
            .split(";")
            .join(";\n"));
};
//# sourceMappingURL=code.js.map