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
import { PCSourceTagNames } from "paperclip";
import { textValueChanged } from "../../../../../actions";
export default (Base) => class TextController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onTextValueChange = value => {
            this.props.dispatch(textValueChanged(value));
        };
    }
    render() {
        const _a = this.props, { selectedNodes } = _a, rest = __rest(_a, ["selectedNodes"]);
        const { onTextValueChange } = this;
        const textNode = selectedNodes.find((node) => node.name == PCSourceTagNames.TEXT);
        if (!textNode) {
            return null;
        }
        return (React.createElement(Base, Object.assign({}, rest, { textInputProps: {
                value: textNode.value,
                onChange: onTextValueChange
            } })));
    }
};
//# sourceMappingURL=text-controller.js.map