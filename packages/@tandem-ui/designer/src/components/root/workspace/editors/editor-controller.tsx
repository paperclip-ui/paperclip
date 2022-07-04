import * as React from "react";
import cx from "classnames";
import {
  EditorWindow,
  RootState,
  isImageMimetype,
  getOpenFile,
} from "../../../../state";
import { Dispatch } from "redux";
import { StageComponent as PaperclipStageComponent } from "./paperclip/stage";
import { ImageEditorWindowComponent } from "./image";
import {
  PAPERCLIP_MIME_TYPE,
  InspectorNode,
  DependencyGraph,
  getInspectorNodeBySourceNodeId,
  getInspectorContentNode,
} from "@paperclip-lang/core";
import { getFSItem } from "fsbox";
import { BaseEditorProps } from "./editor.pc";
import { TextEditorWindow } from "./text";
import { memoize, getNestedTreeNodeById, EMPTY_ARRAY } from "tandem-common";

export type Props = {
  editorWindow: EditorWindow;
  root: RootState;
  dispatch: Dispatch<any>;
};

const filterEditorInspectorNodes = memoize(
  (
    inspectorNodes: InspectorNode[],
    rootInspectorNode: InspectorNode,
    editor: EditorWindow,
    graph: DependencyGraph
  ) => {
    const dep = graph[editor.activeFilePath];

    if (!dep) {
      return EMPTY_ARRAY;
    }
    const moduleInspectorNode = getInspectorNodeBySourceNodeId(
      dep.content.id,
      rootInspectorNode
    );
    return inspectorNodes.filter((node) =>
      getNestedTreeNodeById(node.id, moduleInspectorNode)
    );
  }
);

export default (Base: React.ComponentClass<BaseEditorProps>) =>
  class EditorController extends React.PureComponent<Props> {
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

      const selectedInspectorNodes = filterEditorInspectorNodes(
        root.selectedInspectorNodes,
        root.sourceNodeInspector,
        editorWindow,
        root.graph
      );

      if (fileCacheItem.content) {
        if (fileCacheItem.mimeType === PAPERCLIP_MIME_TYPE) {
          const dependency =
            window && root.graph && root.graph[editorWindow.activeFilePath];

          if (!dependency) {
            return null;
          }

          stage = (
            <PaperclipStageComponent
              editMode={root.editMode}
              selectedComponentId={selectedComponentId}
              sourceNodeInspector={root.sourceNodeInspector}
              openFiles={root.openFiles}
              documents={root.documents}
              graph={root.graph}
              frames={root.frames}
              selectedInspectorNodes={selectedInspectorNodes}
              hoveringInspectorNodes={filterEditorInspectorNodes(
                root.hoveringInspectorNodes,
                root.sourceNodeInspector,
                editorWindow,
                root.graph
              )}
              activeFilePath={root.activeEditorFilePath}
              toolType={selectedTool}
              dispatch={dispatch}
              dependency={dependency}
              editorWindow={editorWindow}
            />
          );
        } else if (isImageMimetype(fileCacheItem.mimeType)) {
          stage = (
            <ImageEditorWindowComponent
              dispatch={dispatch}
              fileCacheItem={fileCacheItem}
            />
          );
        } else {
          stage = (
            <TextEditorWindow
              dispatch={dispatch}
              fileCacheItem={fileCacheItem}
            />
          );
        }
      }
      const active = root.activeEditorFilePath === editorWindow.activeFilePath;

      const openFile = getOpenFile(editorWindow.activeFilePath, root.openFiles);

      const canvas = openFile && openFile.canvas;

      return (
        <Base
          toolbarProps={{
            graph,
            dispatch,
            editorWindow,
            selectedTool,
            active,
            selectedComponentId,
          }}
          contentProps={{ children: stage }}
          editorFooterProps={{
            dispatch,
            canvas,
            graph,
            rootInspectorNode:
              selectedInspectorNodes.length &&
              getInspectorContentNode(
                selectedInspectorNodes[0],
                root.sourceNodeInspector
              ),
            selectedInspectorNode: selectedInspectorNodes[0],
          }}
        />
      );
    }
  };
