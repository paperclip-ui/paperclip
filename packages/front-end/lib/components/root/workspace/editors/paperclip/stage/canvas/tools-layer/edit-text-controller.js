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
import { getInspectorSourceNode, getInspectorSyntheticNode, isTextLikePCNode, getSyntheticVisibleNodeRelativeBounds } from "paperclip";
import { FocusComponent } from "../../../../../../../focus";
import { canvasTextEditChangeComplete } from "../../../../../../../../actions";
export default (Base) => class EditTextController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChangeComplete = (value) => {
            this.props.dispatch(canvasTextEditChangeComplete(value));
        };
    }
    render() {
        const _a = this.props, { selectedInspectorNode, selectedSyntheticNode, frames, rootInspectorNode, graph, documents } = _a, rest = __rest(_a, ["selectedInspectorNode", "selectedSyntheticNode", "frames", "rootInspectorNode", "graph", "documents"]);
        const { onChangeComplete } = this;
        const sourceNode = getInspectorSourceNode(selectedInspectorNode, rootInspectorNode, graph);
        if (!sourceNode || !isTextLikePCNode(sourceNode)) {
            return null;
        }
        const syntheticNode = getInspectorSyntheticNode(selectedInspectorNode, documents);
        if (!syntheticNode) {
            return null;
        }
        const bounds = getSyntheticVisibleNodeRelativeBounds(syntheticNode, frames, graph);
        const style = {
            left: bounds.left,
            top: bounds.top,
            width: bounds.right - bounds.left,
            height: bounds.bottom - bounds.top
        };
        return (React.createElement(FocusComponent, null,
            React.createElement(Base, Object.assign({}, rest, { style: style, value: selectedSyntheticNode.value, onChangeComplete: onChangeComplete }))));
    }
};
//# sourceMappingURL=edit-text-controller.js.map