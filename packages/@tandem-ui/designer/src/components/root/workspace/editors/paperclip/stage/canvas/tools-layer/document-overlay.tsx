const cx = require("classnames");
import * as React from "react";
import Hammer from "react-hammerjs";
import { wrapEventToDispatch } from "../../../../../../../../utils";
import { EditorWindow } from "../../../../../../../../state";
import {
  Frame,
  getFramesByDependencyUri,
  SyntheticDocument,
  DependencyGraph,
  InspectorNode,
  getInspectorSyntheticNode,
} from "@paperclip-lang/core";
import {
  Bounds,
  memoize,
  TreeNodeIdMap,
  StructReference,
  reuser,
} from "tandem-common";
// import { Dispatcher, Bounds, wrapEventToDispatch, weakMemo, StructReference } from "aerial-common2";
import { Dispatch } from "redux";
import {
  canvasToolOverlayMousePanStart,
  canvasToolOverlayMousePanning,
  canvasToolOverlayMousePanEnd,
  canvasToolOverlayMouseDoubleClicked,
} from "../../../../../../../../actions";

import { NodeOverlay as BaseNodeOverlay } from "./node-overlay.pc";

export type VisualToolsProps = {
  editorWindow: EditorWindow;
  zoom: number;
  document: SyntheticDocument;
  hoveringInspectorNodes: InspectorNode[];
  selectedInspectorNodes: InspectorNode[];
  documents: SyntheticDocument[];
  frames: Frame[];
  graph: DependencyGraph;
  dispatch: Dispatch<any>;
};

type ArtboardOverlayToolsOuterProps = {
  dispatch: Dispatch<any>;
  frame: Frame;
  zoom: number;
  hoveringSyntheticNodeIds: string[];
};

type NodeOverlayProps = {
  bounds: Bounds;
  zoom: number;
  dispatch: Dispatch<any>;
};

class NodeOverlay extends React.PureComponent<NodeOverlayProps> {
  render() {
    const { zoom, bounds, dispatch } = this.props;
    if (!bounds) {
      return null;
    }

    const borderWidth = 2 / zoom;

    const width = Math.ceil(bounds.right - bounds.left);
    const height = Math.ceil(bounds.bottom - bounds.top);

    const titleScale = Math.max(1 / zoom, 0.03);

    const textStyle = {
      transformOrigin: `top right`,
      transform: `scale(${titleScale})`,
    };

    const style = {
      left: bounds.left,
      top: bounds.top,

      // round to ensure that the bounds match up with the selection bounds
      width,
      height,
      boxShadow: `inset 0 0 0 ${borderWidth}px rgba(88, 185, 255, 1)`,
    };

    return (
      <BaseNodeOverlay
        style={style}
        labelContainerProps={{ style: textStyle }}
        labelProps={{
          text: `${width} x ${height}`,
        }}
      />
    );
  }
}

const getDocumentRelativeBounds = memoize((document: Frame) => ({
  left: 0,
  top: 0,
  right: document.bounds.right - document.bounds.left,
  bottom: document.bounds.bottom - document.bounds.top,
}));

class ArtboardOverlayTools extends React.PureComponent<ArtboardOverlayToolsOuterProps> {
  onPanStart = (event) => {
    this.props.dispatch(
      canvasToolOverlayMousePanStart(this.props.frame.syntheticContentNodeId)
    );
  };
  onPan = (event) => {
    this.props.dispatch(
      canvasToolOverlayMousePanning(
        this.props.frame.syntheticContentNodeId,
        { left: event.center.x, top: event.center.y },
        event.deltaY,
        event.velocityY
      )
    );
  };
  onPanEnd = (event) => {
    event.preventDefault();
    setTimeout(() => {
      this.props.dispatch(
        canvasToolOverlayMousePanEnd(this.props.frame.syntheticContentNodeId)
      );
    });
  };

  render() {
    const { dispatch, frame, hoveringSyntheticNodeIds, zoom } = this.props;

    const { onPanStart, onPan, onPanEnd } = this;
    if (!frame.computed) {
      return null;
    }

    if (!frame.bounds) {
      return null;
    }

    const bounds = frame.bounds;

    // TODO - compute info based on content
    const style = {
      position: "absolute",
      left: bounds.left,
      top: bounds.top,
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top,
    };

    return (
      <div style={style as any}>
        <Hammer
          onPanStart={onPanStart}
          onPan={onPan}
          onPanEnd={onPanEnd}
          direction="DIRECTION_ALL"
        >
          <div
            style={
              { width: "100%", height: "100%", position: "absolute" } as any
            }
            onDoubleClick={wrapEventToDispatch(
              dispatch,
              canvasToolOverlayMouseDoubleClicked.bind(
                this,
                frame.syntheticContentNodeId
              )
            )}
          >
            {hoveringSyntheticNodeIds.map((nodeId, i) => (
              <NodeOverlay
                zoom={zoom}
                key={nodeId}
                bounds={
                  frame.syntheticContentNodeId === nodeId
                    ? getDocumentRelativeBounds(frame)
                    : frame.computed[nodeId] && frame.computed[nodeId].bounds
                }
                dispatch={dispatch}
              />
            ))}
          </div>
        </Hammer>
      </div>
    );
  }
}

const reuseHoveringSyntheticNodeIds = reuser(10, (a: string[]) => a.join(","));

const getHoveringSyntheticVisibleNodes = (
  hoveringInspectorNodes: InspectorNode[],
  selectedInspectorNodes: InspectorNode[],
  documents: SyntheticDocument[],
  frame: Frame
): string[] => {
  const selectionRefIds = selectedInspectorNodes;
  return hoveringInspectorNodes
    .filter((node) => {
      const syntheticNode = getInspectorSyntheticNode(node, documents);
      return (
        (syntheticNode && frame.computed && frame.computed[syntheticNode.id]) ||
        frame.syntheticContentNodeId === node.id
      );
    })
    .map((node) => getInspectorSyntheticNode(node, documents).id);
};

export class NodeOverlaysTool extends React.PureComponent<VisualToolsProps> {
  render() {
    const {
      frames,
      editorWindow,
      dispatch,
      documents,
      graph,
      hoveringInspectorNodes,
      selectedInspectorNodes,
      zoom,
    } = this.props;
    const activeFrames = getFramesByDependencyUri(
      editorWindow.activeFilePath,
      frames,
      documents,
      graph
    );

    return (
      <div className="visual-tools-layer-component">
        {activeFrames.map((frame: Frame, i) => {
          return (
            <ArtboardOverlayTools
              key={frame.syntheticContentNodeId}
              frame={frame}
              hoveringSyntheticNodeIds={getHoveringSyntheticVisibleNodes(
                hoveringInspectorNodes,
                selectedInspectorNodes,
                documents,
                frame
              )}
              dispatch={dispatch}
              zoom={zoom}
            />
          );
        })}
      </div>
    );
  }
}
