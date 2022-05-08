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
import { inspectorNodeInShadow, getInspectorContentNode, InspectorTreeNodeName } from "paperclip";
import { exportNameChanged } from "../../../../../actions";
// ^[a-zA-Z_$][\w_$]*$
export default (Base) => class ExportsController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onNameChangeComplete = value => {
            this.props.dispatch(exportNameChanged(value));
        };
    }
    render() {
        const _a = this.props, { selectedInspectorNode, rootInspectorNode } = _a, rest = __rest(_a, ["selectedInspectorNode", "rootInspectorNode"]);
        const { onNameChangeComplete } = this;
        const contentInspectorNode = getInspectorContentNode(selectedInspectorNode, rootInspectorNode) ||
            selectedInspectorNode;
        if (inspectorNodeInShadow(selectedInspectorNode, contentInspectorNode) ||
            selectedInspectorNode.name === InspectorTreeNodeName.SHADOW) {
            return null;
        }
        return (React.createElement(Base, Object.assign({}, rest, { exportsNameInputProps: {
                value: null,
                onChangeComplete: onNameChangeComplete,
                // this is technically valid, but hard to communicate to user
                // validRegexp: /^[a-zA-Z_$][\w_$]*$/,
                validRegexp: /^[a-zA-Z_]+$/,
                // simplified messaging
                errorMessage: "Name must contain only letters or _"
            } })));
    }
};
//# sourceMappingURL=exports-controller.js.map