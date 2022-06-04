import * as React from "react";
import { BaseLeftGutterProps } from "./view.pc";
import { DependencyGraph, InspectorNode, SyntheticDocument } from "paperclip";
import { Dispatch } from "redux";
import { Directory, startDOMDrag } from "tandem-common";
import { NewFSItemInfo } from "../../../../state";
export type Props = {
  newFSItemInfo: NewFSItemInfo;
  show?: boolean;
  graph: DependencyGraph;
  activeEditorUri: string;
  selectedInspectorNodes: InspectorNode[];
  hoveringInspectorNodes: InspectorNode[];
  selectedFileNodeIds: string[];
  sourceNodeInspector: InspectorNode;
  rootDirectory: Directory;
  renameInspectorNodeId: string;
  dispatch: Dispatch<any>;
  editingFileNameUri: string;
  documents: SyntheticDocument[];
};

type State = {
  width: number;
};

const MIN_WIDTH = 200;

export default (Base: React.ComponentClass<BaseLeftGutterProps>) =>
  class LeftGutterController extends React.PureComponent<Props, State> {
    state = {
      width: 250,
    };

    _dragger: HTMLDivElement;
    setDragger = (dragger: HTMLDivElement) => {
      this._dragger = dragger;
    };
    onDraggerMouseDown = (event: React.MouseEvent<any>) => {
      const initialWidth = this.state.width;
      startDOMDrag(
        event,
        () => {},
        (event, data) => {
          this.setState({ width: Math.max(MIN_WIDTH, event.clientX) });
        }
      );
    };
    render() {
      const {
        graph,
        newFSItemInfo,
        activeEditorUri,
        selectedInspectorNodes,
        hoveringInspectorNodes,
        selectedFileNodeIds,
        sourceNodeInspector,
        renameInspectorNodeId,
        dispatch,
        documents,
        editingFileNameUri,
        rootDirectory,
        show,
        ...rest
      } = this.props;
      const { setDragger, onDraggerMouseDown } = this;
      if (show === false) {
        return null;
      }

      return (
        <Base
          {...rest}
          style={{
            width: this.state.width,
          }}
          openModulesPaneProps={{
            graph,
            selectedInspectorNodes,
            hoveringInspectorNodes,
            renameInspectorNodeId,
            sourceNodeInspector,
            dispatch,
            documents,
          }}
          fileNavigatorPaneProps={{
            newFSItemInfo,
            editingFileNameUri,
            activeEditorUri,
            rootDirectory,
            dispatch,
            selectedFileNodeIds,
          }}
          draggerProps={{
            ref: setDragger,
            onMouseDown: onDraggerMouseDown,
          }}
        />
      );
    }
  };
