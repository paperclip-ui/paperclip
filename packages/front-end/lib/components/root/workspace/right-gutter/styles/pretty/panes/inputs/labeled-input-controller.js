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
import { cssInheritedFromLabelClicked } from "../../../../../../../../actions";
export default (Base) => class LabeledCSSInputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onLabelClick = () => {
            if (this.props.inheritedFromNode) {
                this.props.dispatch(cssInheritedFromLabelClicked(this.props.inheritedFromNode));
            }
        };
    }
    render() {
        const { onLabelClick } = this;
        const _a = this.props, { inheritedFromNode } = _a, rest = __rest(_a, ["inheritedFromNode"]);
        return (React.createElement(Base, Object.assign({}, rest, { textInputProps: null, projectNameInputProps: null, variant: cx({
                inherited: Boolean(inheritedFromNode)
            }), labelProps: {
                onClick: onLabelClick
            } })));
    }
};
//# sourceMappingURL=labeled-input-controller.js.map