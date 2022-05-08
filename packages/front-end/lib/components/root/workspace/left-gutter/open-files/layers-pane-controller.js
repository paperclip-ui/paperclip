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
import { getSyntheticDocumentByDependencyUri, getPCNodeDependency, getPCNode } from "paperclip";
import { OpenModule } from "./open-module.pc";
import { LayersPaneContext } from "./contexts";
const generateLayersPaneContext = memoize((graph, selectedInspectorNodes, hoveringInspectorNodes, renameInspectorNodeId, rootInspectorNode, dispatch) => {
    return {
        graph,
        rootInspectorNode,
        renameInspectorNodeId,
        selectedInspectorNodes,
        hoveringInspectorNodes,
        dispatch
    };
});
const CONTENT_STYLE = {
    display: "inline-block",
    minWidth: "100%"
};
export default (Base) => class LayersPaneController extends React.PureComponent {
    render() {
        const _a = this.props, { sourceNodeInspector, graph, documents, dispatch, selectedInspectorNodes, hoveringInspectorNodes, renameInspectorNodeId } = _a, rest = __rest(_a, ["sourceNodeInspector", "graph", "documents", "dispatch", "selectedInspectorNodes", "hoveringInspectorNodes", "renameInspectorNodeId"]);
        const content = (React.createElement("div", { style: CONTENT_STYLE }, sourceNodeInspector.children.map((inspectorNode, i) => {
            const sourceNode = getPCNode(inspectorNode.sourceNodeId, graph);
            if (!sourceNode) {
                return null;
            }
            const dependency = getPCNodeDependency(sourceNode.id, graph);
            const document = getSyntheticDocumentByDependencyUri(dependency.uri, documents, graph);
            return (React.createElement(LayersPaneContext.Provider, { key: inspectorNode.id, value: generateLayersPaneContext(graph, selectedInspectorNodes, hoveringInspectorNodes, renameInspectorNodeId, sourceNodeInspector, dispatch) },
                React.createElement(OpenModule, { inspectorNode: inspectorNode })));
        })));
        return React.createElement(Base, Object.assign({}, rest, { contentProps: { children: content } }));
    }
};
//# sourceMappingURL=layers-pane-controller.js.map