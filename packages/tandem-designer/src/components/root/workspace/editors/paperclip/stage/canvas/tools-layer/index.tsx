/**
 * tools overlay like measurements, resizers, etc
 */

import * as React from "react";
import { Dispatch } from "redux";
import {
  EditorWindow,
  getOpenFile,
  OpenFile,
  ToolType,
  EditMode,
} from "tandem-designer/src/state";
import { NodeOverlaysTool } from "./document-overlay";
import { SelectionCanvasTool } from "./selection";
import { Frames } from "./frames-view.pc";
import { InsertLayer } from "./insert-layer";
import * as styles from "./styles";
import {
  getSyntheticDocumentByDependencyUri,
  SyntheticDocument,
  DependencyGraph,
  SyntheticTextNode,
  getSyntheticVisibleNodeRelativeBounds,
  Frame,
} from "paperclip";
import { memoize, mergeBounds, Bounds, findNestedNode } from "tandem-common";
import {
  InspectorNode,
  getInspectorSyntheticNode,
  InspectorTreeNodeName,
  getInspectorNodeOwnerInstance,
} from "paperclip";
import { EditText } from "./edit-text.pc";
import { useDispatch } from "react-redux";

export type ToolsLayerComponentProps = {
  editorWindow: EditorWindow;
  selectedComponentId: string;
  editMode: EditMode;
  zoom: number;
  toolType: ToolType;
  activeEditorUri: string;
  hoveringInspectorNodes: InspectorNode[];
  selectedInspectorNodes: InspectorNode[];
  sourceNodeInspector: InspectorNode;
  openFiles: OpenFile[];
  documents: SyntheticDocument[];
  frames: Frame[];
  graph: DependencyGraph;
};

export const ToolsLayerComponent = (props: ToolsLayerComponentProps) => {
  const {
    editorWindow,
    hoveringInspectorNodes,
    selectedInspectorNodes,
    sourceNodeInspector,
    activeEditorUri,
    openFiles,
    selectedComponentId,
    zoom,
    editMode,
    graph,
    documents,
    toolType,
    frames,
  } = props;

  const dispatch = useDispatch();
  const canvas = getOpenFile(editorWindow.activeFilePath, openFiles).canvas;
  const insertInspectorNode = hoveringInspectorNodes[0];
  const insertInspectorNodeBounds =
    insertInspectorNode &&
    calcInspectorNodeBounds(
      insertInspectorNode,
      sourceNodeInspector,
      documents,
      frames,
      graph
    );
  const selectedSyntheticNode =
    selectedInspectorNodes[0] &&
    getInspectorSyntheticNode(selectedInspectorNodes[0], documents);
  return (
    <styles.ToolsLayer>
      <InsertLayer
        selectedComponentId={selectedComponentId}
        activeEditorUri={activeEditorUri}
        canvas={canvas}
        zoom={zoom}
        editorWindow={editorWindow}
        toolType={toolType}
        dispatch={dispatch}
        insertInspectorNode={insertInspectorNode}
        insertInspectorNodeBounds={insertInspectorNodeBounds}
      />
      <Frames
        canvas={canvas}
        frames={frames}
        documents={documents}
        graph={graph}
        translate={canvas.translate}
        editorWindow={editorWindow}
      />
      <NodeOverlaysTool
        frames={frames}
        documents={documents}
        hoveringInspectorNodes={hoveringInspectorNodes}
        selectedInspectorNodes={selectedInspectorNodes}
        graph={graph}
        zoom={zoom}
        dispatch={dispatch}
        document={getSyntheticDocumentByDependencyUri(
          editorWindow.activeFilePath,
          documents,
          graph
        )}
        editorWindow={editorWindow}
      />
      <SelectionCanvasTool
        canvas={canvas}
        rootInspectorNode={sourceNodeInspector}
        selectedInspectorNodes={selectedInspectorNodes}
        documents={documents}
        frames={frames}
        graph={graph}
        zoom={zoom}
        document={getSyntheticDocumentByDependencyUri(
          editorWindow.activeFilePath,
          documents,
          graph
        )}
        editorWindow={editorWindow}
      />
      {editMode === EditMode.SECONDARY && selectedInspectorNodes.length ? (
        <EditText
          dispatch={dispatch}
          frames={frames}
          documents={documents}
          graph={graph}
          rootInspectorNode={sourceNodeInspector}
          selectedInspectorNode={selectedInspectorNodes[0]}
          selectedSyntheticNode={selectedSyntheticNode as SyntheticTextNode}
        />
      ) : null}
    </styles.ToolsLayer>
  );
};

const calcInspectorNodeBounds = memoize(
  (
    inspectorNode: InspectorNode,
    root: InspectorNode,
    documents: SyntheticDocument[],
    frames: Frame[],
    graph: DependencyGraph
  ): Bounds => {
    const assocSyntheticNode = getInspectorSyntheticNode(
      inspectorNode,
      documents
    );

    if (assocSyntheticNode) {
      return getSyntheticVisibleNodeRelativeBounds(
        assocSyntheticNode,
        frames,
        graph
      );
    }

    let assocInspectorNode: InspectorNode;

    if (inspectorNode.name === InspectorTreeNodeName.CONTENT) {
      const instance = getInspectorNodeOwnerInstance(inspectorNode, root);

      // find the slot
      assocInspectorNode = findNestedNode(
        instance,
        (child: InspectorNode) =>
          child.sourceNodeId === inspectorNode.sourceNodeId &&
          child.name === InspectorTreeNodeName.SOURCE_REP
      );
    } else {
      assocInspectorNode = inspectorNode;
    }

    return mergeBounds(
      ...assocInspectorNode.children
        .map((child) => {
          const assocChildSyntheticNode = getInspectorSyntheticNode(
            child,
            documents
          );
          return (
            assocChildSyntheticNode &&
            getSyntheticVisibleNodeRelativeBounds(
              assocChildSyntheticNode,
              frames,
              graph
            )
          );
        })
        .filter(Boolean)
    );
  }
);
