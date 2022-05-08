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
import { attributeChanged } from "../../../../../actions";
export default (Base) => class APropertiesController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onHrefChangeComplete = value => {
            this.props.dispatch(attributeChanged("href", value));
        };
    }
    render() {
        const _a = this.props, { baseName, sourceNode } = _a, rest = __rest(_a, ["baseName", "sourceNode"]);
        const { onHrefChangeComplete } = this;
        if (baseName !== "a") {
            return null;
        }
        return (React.createElement(Base, Object.assign({}, rest, { hrefInputProps: {
                value: sourceNode.attributes.href,
                onChange: onHrefChangeComplete
            } })));
    }
};
//# sourceMappingURL=a-controller.js.map