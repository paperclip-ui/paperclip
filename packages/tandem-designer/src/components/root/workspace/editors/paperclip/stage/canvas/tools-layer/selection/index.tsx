import "./index.scss";
import React, { memo } from "react";
import { Resizer } from "./resizer";
import { Dispatch } from "redux";
import {
  RootState,
  getBoundedSelection,
  EditorWindow,
  getSelectionBounds,
  Canvas,
} from "../../../../../../../../../state";
import {
  getSyntheticVisibleNodeFrame,
  getSyntheticNodeById,
  SyntheticDocument,
  Frame,
  DependencyGraph,
  InspectorNode,
} from "paperclip";
import { getNestedTreeNodeById } from "tandem-common";

export type SelectionOuterProps = {
  canvas: Canvas;
  rootInspectorNode: InspectorNode;
  zoom: number;
  document: SyntheticDocument;
  frames: Frame[];
  documents: SyntheticDocument[];
  graph: DependencyGraph;
  selectedInspectorNodes: InspectorNode[];
  editorWindow: EditorWindow;
};

export type SelectionInnerProps = {
  setSelectionElement(element: HTMLDivElement);
  onDoubleClick(event: React.MouseEvent<any>);
} & SelectionOuterProps;

const SelectionBounds = ({
  zoom,
  selectedInspectorNodes,
  graph,
  frames,
  documents,
}: {
  document: SyntheticDocument;
  selectedInspectorNodes: InspectorNode[];
  graph: DependencyGraph;
  frames: Frame[];
  documents: SyntheticDocument[];
  zoom: number;
}) => {
  const entireBounds = getSelectionBounds(
    selectedInspectorNodes,
    documents,
    frames,
    graph
  );
  const borderWidth = 1 / zoom;
  const boundsStyle = {
    position: "absolute",
    top: entireBounds.top,
    left: entireBounds.left,

    // round bounds so that they match up with the NWSE resizer
    width: entireBounds.right - entireBounds.left,
    height: entireBounds.bottom - entireBounds.top,
    boxShadow: `inset 0 0 0 ${borderWidth}px #00B5FF`,
  };

  return <div style={boundsStyle as any} />;
};

export const SelectionCanvasTool = memo(
  ({
    editorWindow,
    zoom,
    document,
    rootInspectorNode,
    canvas,
    selectedInspectorNodes,
    documents,
    frames,
    graph,
  }: SelectionOuterProps) => {
    const onDoubleClick = (event: React.MouseEvent<any>) => {
      const selection = getBoundedSelection(
        selectedInspectorNodes,
        documents,
        frames,
        graph
      );
      if (selection.length === 1) {
        // dispatch(selectorDoubleClicked(selection[0], event));
      }
    };

    const selection = getBoundedSelection(
      selectedInspectorNodes,
      documents,
      frames,
      graph
    );

    if (!selection.length || editorWindow.secondarySelection) return null;

    return (
      <div className="m-stage-selection-tool" onDoubleClick={onDoubleClick}>
        <SelectionBounds
          frames={frames}
          documents={documents}
          selectedInspectorNodes={selectedInspectorNodes}
          graph={graph}
          zoom={zoom}
          document={document}
        />
        <Resizer
          frames={frames}
          documents={documents}
          graph={graph}
          rootInspectorNode={rootInspectorNode}
          selectedInspectorNodes={selectedInspectorNodes}
          editorWindow={editorWindow}
          canvas={canvas}
          zoom={zoom}
        />
      </div>
    );
  }
);

export * from "./resizer";
