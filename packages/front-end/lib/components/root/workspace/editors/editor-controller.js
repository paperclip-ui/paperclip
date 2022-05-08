import * as React from "react";
import { isImageMimetype, getOpenFile } from "../../../../state";
import { StageComponent as PaperclipStageComponent } from "./paperclip/stage";
import { ImageEditorWindowComponent } from "./image";
import { PAPERCLIP_MIME_TYPE, getInspectorNodeBySourceNodeId, getInspectorContentNode } from "paperclip";
import { getFSItem } from "fsbox";
import { TextEditorWindow } from "./text";
import { memoize, getNestedTreeNodeById, EMPTY_ARRAY } from "tandem-common";
const filterEditorInspectorNodes = memoize((inspectorNodes, rootInspectorNode, editor, graph) => {
    const dep = graph[editor.activeFilePath];
    if (!dep) {
        return EMPTY_ARRAY;
    }
    const moduleInspectorNode = getInspectorNodeBySourceNodeId(dep.content.id, rootInspectorNode);
    return inspectorNodes.filter(node => getNestedTreeNodeById(node.id, moduleInspectorNode));
});
export default (Base) => class EditorController extends React.PureComponent {
    render() {
        const { editorWindow, root, dispatch } = this.props;
        if (!editorWindow) {
            return null;
        }
        const fileCacheItem = getFSItem(editorWindow.activeFilePath, root);
        if (!fileCacheItem || !fileCacheItem.content) {
            return null;
        }
        const graph = root.graph;
        const selectedTool = root.toolType;
        const selectedComponentId = root.selectedComponentId;
        let stage = null;
        const selectedInspectorNodes = filterEditorInspectorNodes(root.selectedInspectorNodes, root.sourceNodeInspector, editorWindow, root.graph);
        if (fileCacheItem.content) {
            if (fileCacheItem.mimeType === PAPERCLIP_MIME_TYPE) {
                const dependency = window && root.graph && root.graph[editorWindow.activeFilePath];
                if (!dependency) {
                    return null;
                }
                stage = (React.createElement(PaperclipStageComponent, { editMode: root.editMode, selectedComponentId: selectedComponentId, sourceNodeInspector: root.sourceNodeInspector, openFiles: root.openFiles, documents: root.documents, graph: root.graph, frames: root.frames, selectedInspectorNodes: selectedInspectorNodes, hoveringInspectorNodes: filterEditorInspectorNodes(root.hoveringInspectorNodes, root.sourceNodeInspector, editorWindow, root.graph), activeFilePath: root.activeEditorFilePath, toolType: selectedTool, dispatch: dispatch, dependency: dependency, editorWindow: editorWindow }));
            }
            else if (isImageMimetype(fileCacheItem.mimeType)) {
                stage = (React.createElement(ImageEditorWindowComponent, { dispatch: dispatch, fileCacheItem: fileCacheItem }));
            }
            else {
                stage = (React.createElement(TextEditorWindow, { dispatch: dispatch, fileCacheItem: fileCacheItem }));
            }
        }
        const active = root.activeEditorFilePath === editorWindow.activeFilePath;
        const openFile = getOpenFile(editorWindow.activeFilePath, root.openFiles);
        const canvas = openFile && openFile.canvas;
        return (React.createElement(Base, { toolbarProps: {
                graph,
                dispatch,
                editorWindow,
                selectedTool,
                active,
                selectedComponentId
            }, contentProps: { children: stage }, editorFooterProps: {
                dispatch,
                canvas,
                graph,
                rootInspectorNode: selectedInspectorNodes.length &&
                    getInspectorContentNode(selectedInspectorNodes[0], root.sourceNodeInspector),
                selectedInspectorNode: selectedInspectorNodes[0]
            } }));
    }
};
//# sourceMappingURL=editor-controller.js.map