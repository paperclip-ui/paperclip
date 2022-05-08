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
import { PCSourceTagNames, getPCNode, isPCContentNode, isElementLikePCNode, isTextLikePCNode } from "paperclip";
export default (Base) => class PropertiesController extends React.PureComponent {
    render() {
        const _a = this.props, { visible, className, selectedInspectorNodes, rootInspectorNode, selectedNodes, graph, dispatch, sourceNodeUri } = _a, rest = __rest(_a, ["visible", "className", "selectedInspectorNodes", "rootInspectorNode", "selectedNodes", "graph", "dispatch", "sourceNodeUri"]);
        if (!selectedInspectorNodes.length || !visible) {
            return null;
        }
        const selectedNode = selectedInspectorNodes[0];
        const sourceNode = getPCNode(selectedNode.sourceNodeId, graph);
        return (React.createElement(Base, Object.assign({ className: className }, rest, { variant: cx({
                slot: sourceNode.name === PCSourceTagNames.SLOT,
                component: sourceNode.name === PCSourceTagNames.COMPONENT,
                text: isTextLikePCNode(sourceNode),
                element: isElementLikePCNode(sourceNode),
                contentNode: isPCContentNode(sourceNode, graph)
            }), framePaneProps: {
                dispatch,
                selectedNode: sourceNode,
                graph
            }, controllersPaneProps: {
                selectedNodes,
                graph,
                dispatch,
                sourceNodeUri
            }, textProps: {
                dispatch,
                selectedNodes
            }, elementProps: {
                sourceNode: sourceNode,
                graph,
                dispatch
            } })));
    }
};
//# sourceMappingURL=properties-controller.js.map