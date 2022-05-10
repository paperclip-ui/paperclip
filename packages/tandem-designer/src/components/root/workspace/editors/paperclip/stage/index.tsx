import "./index.scss";
import { Dispatch } from "redux";
import * as React from "react";
import { CanvasComponent } from "./canvas";
import { FooterComponent } from "./footer";
import {
  Dependency,
  DependencyGraph,
  SyntheticDocument,
  Frame,
} from "paperclip";
import {
  RootState,
  EditorWindow,
  OpenFile,
  ToolType,
  EditMode,
} from "../../../../../../state";
import { InspectorNode } from "paperclip";

export type StageOuterProps = {
  editorWindow: EditorWindow;
  hoveringInspectorNodes: InspectorNode[];
  selectedInspectorNodes: InspectorNode[];
  dependency: Dependency<any>;
  dispatch: Dispatch<any>;
  selectedComponentId: string;
  graph: DependencyGraph;
  frames: Frame[];
  activeFilePath: string;
  documents: SyntheticDocument[];
  openFiles: OpenFile[];
  toolType: ToolType;
  sourceNodeInspector: InspectorNode;
  editMode: EditMode;
};

export class StageComponent extends React.PureComponent<StageOuterProps> {
  render() {
    const {
      toolType,
      openFiles,
      editorWindow,
      dependency,
      dispatch,
      frames,
      editMode,
      sourceNodeInspector,
      selectedInspectorNodes,
      hoveringInspectorNodes,
      activeFilePath,
      selectedComponentId,
      graph,
      documents,
    } = this.props;
    return (
      <div className="m-stage">
        <CanvasComponent
          activeFilePath={activeFilePath}
          selectedComponentId={selectedComponentId}
          frames={frames}
          editMode={editMode}
          toolType={toolType}
          openFiles={openFiles}
          sourceNodeInspector={sourceNodeInspector}
          hoveringInspectorNodes={hoveringInspectorNodes}
          selectedInspectorNodes={selectedInspectorNodes}
          graph={graph}
          documents={documents}
          dependency={dependency}
          dispatch={dispatch}
          editorWindow={editorWindow}
        />
        {/* <FooterComponent /> */}
      </div>
    );
  }
}
