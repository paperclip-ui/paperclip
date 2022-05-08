/**
 * tools overlay like measurements, resizers, etc
 */
import "./index.scss";
import * as React from "react";
import { getOpenFile, EditMode } from "../../../../../../../../state";
import { NodeOverlaysTool } from "./document-overlay";
import { SelectionCanvasTool } from "./selection";
import { Frames } from "./frames-view.pc";
import { InsertLayer } from "./insert-layer";
import { getSyntheticDocumentByDependencyUri, getSyntheticVisibleNodeRelativeBounds } from "paperclip";
import { memoize, mergeBounds, findNestedNode } from "tandem-common";
import { getInspectorSyntheticNode, InspectorTreeNodeName, getInspectorNodeOwnerInstance } from "paperclip";
import { EditText } from "./edit-text.pc";
export class ToolsLayerComponent extends React.PureComponent {
    render() {
        const { editorWindow, hoveringInspectorNodes, selectedInspectorNodes, sourceNodeInspector, activeEditorUri, openFiles, selectedComponentId, zoom, dispatch, editMode, graph, documents, toolType, frames } = this.props;
        const canvas = getOpenFile(editorWindow.activeFilePath, openFiles).canvas;
        const insertInspectorNode = hoveringInspectorNodes[0];
        const insertInspectorNodeBounds = insertInspectorNode &&
            calcInspectorNodeBounds(insertInspectorNode, sourceNodeInspector, documents, frames, graph);
        const selectedSyntheticNode = selectedInspectorNodes[0] &&
            getInspectorSyntheticNode(selectedInspectorNodes[0], documents);
        return (React.createElement("div", { className: "m-tools-layer" },
            React.createElement(InsertLayer, { selectedComponentId: selectedComponentId, activeEditorUri: activeEditorUri, canvas: canvas, zoom: zoom, editorWindow: editorWindow, toolType: toolType, dispatch: dispatch, insertInspectorNode: insertInspectorNode, insertInspectorNodeBounds: insertInspectorNodeBounds }),
            React.createElement(Frames, { canvas: canvas, frames: frames, documents: documents, graph: graph, translate: canvas.translate, dispatch: dispatch, editorWindow: editorWindow }),
            React.createElement(NodeOverlaysTool, { frames: frames, documents: documents, hoveringInspectorNodes: hoveringInspectorNodes, selectedInspectorNodes: selectedInspectorNodes, graph: graph, zoom: zoom, dispatch: dispatch, document: getSyntheticDocumentByDependencyUri(editorWindow.activeFilePath, documents, graph), editorWindow: editorWindow }),
            React.createElement(SelectionCanvasTool, { canvas: canvas, rootInspectorNode: sourceNodeInspector, selectedInspectorNodes: selectedInspectorNodes, documents: documents, frames: frames, graph: graph, dispatch: dispatch, zoom: zoom, document: getSyntheticDocumentByDependencyUri(editorWindow.activeFilePath, documents, graph), editorWindow: editorWindow }),
            editMode === EditMode.SECONDARY && selectedInspectorNodes.length ? (React.createElement(EditText, { dispatch: dispatch, frames: frames, documents: documents, graph: graph, rootInspectorNode: sourceNodeInspector, selectedInspectorNode: selectedInspectorNodes[0], selectedSyntheticNode: selectedSyntheticNode })) : null));
    }
}
const calcInspectorNodeBounds = memoize((inspectorNode, root, documents, frames, graph) => {
    const assocSyntheticNode = getInspectorSyntheticNode(inspectorNode, documents);
    if (assocSyntheticNode) {
        return getSyntheticVisibleNodeRelativeBounds(assocSyntheticNode, frames, graph);
    }
    let assocInspectorNode;
    if (inspectorNode.name === InspectorTreeNodeName.CONTENT) {
        const instance = getInspectorNodeOwnerInstance(inspectorNode, root);
        // find the slot
        assocInspectorNode = findNestedNode(instance, (child) => child.sourceNodeId === inspectorNode.sourceNodeId &&
            child.name === InspectorTreeNodeName.SOURCE_REP);
    }
    else {
        assocInspectorNode = inspectorNode;
    }
    return mergeBounds(...assocInspectorNode.children
        .map(child => {
        const assocChildSyntheticNode = getInspectorSyntheticNode(child, documents);
        return (assocChildSyntheticNode &&
            getSyntheticVisibleNodeRelativeBounds(assocChildSyntheticNode, frames, graph));
    })
        .filter(Boolean));
});
//# sourceMappingURL=index.js.map