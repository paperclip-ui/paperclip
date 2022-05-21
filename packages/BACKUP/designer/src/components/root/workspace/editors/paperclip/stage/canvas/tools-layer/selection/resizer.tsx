import "./resizer.scss";
import React, { memo } from "react";
import { debounce } from "lodash";
import {
  EditorWindow,
  getSelectionBounds,
  isSelectionMovable,
  isSelectionResizable,
  Canvas,
} from "@tandem-ui/designer/src/state";
import {
  resizerMoved,
  resizerStoppedMoving,
  resizerMouseDown,
  resizerStartDrag,
} from "@tandem-ui/designer/src/actions";
import { startDOMDrag } from "tandem-common";
import { Dispatch } from "redux";
import { Path } from "./path";
import {
  Frame,
  SyntheticDocument,
  DependencyGraph,
  InspectorNode,
} from "paperclip";
import { useDispatch } from "react-redux";

export type ResizerOuterProps = {
  frames: Frame[];
  documents: SyntheticDocument[];
  graph: DependencyGraph;
  selectedInspectorNodes: InspectorNode[];
  canvas: Canvas;
  rootInspectorNode: InspectorNode;
  editorWindow: EditorWindow;
  zoom: number;
};

export type ResizerInnerProps = {
  onMouseDown: (event: React.MouseEvent<any>) => any;
} & ResizerOuterProps;

const POINT_STROKE_WIDTH = 1;
const POINT_RADIUS = 4;

export const Resizer = memo(
  ({
    zoom,
    selectedInspectorNodes,
    rootInspectorNode,
    graph,
    documents,
    canvas,
    frames,
  }: ResizerOuterProps) => {
    const dispatch = useDispatch();
    const onMouseDown = (event: React.MouseEvent<any>) => {
      // 2 if right click. Don't want that or else this will happen:
      // https://github.com/tandemcode/tandem/issues/503
      if (event.button !== 0) {
        return;
      }

      dispatch(resizerMouseDown(event));

      const translate = canvas.translate;
      const bounds = getSelectionBounds(
        selectedInspectorNodes,
        documents,
        frames,
        graph
      );
      const onStartDrag = (event) => {
        dispatch(resizerStartDrag(event));
      };

      const calcMousePoint = (delta: any) => ({
        left: bounds.left + delta.x / translate.zoom,
        top: bounds.top + delta.y / translate.zoom,
      });
      const onDrag = (event2, { delta }) => {
        dispatch(resizerMoved(calcMousePoint(delta)));
      };

      // debounce stopped moving so that it beats the stage click event
      // which checks for moving or resizing state.
      const onStopDrag = debounce((event, { delta }) => {
        dispatch(resizerStoppedMoving(calcMousePoint(delta)));
      }, 0);

      startDOMDrag(event, onStartDrag, onDrag, onStopDrag);
    };

    const bounds = getSelectionBounds(
      selectedInspectorNodes,
      documents,
      frames,
      graph
    );

    // offset stroke
    const resizerStyle = {
      position: "absolute",
      left: bounds.left,
      top: bounds.top,
      width: bounds.right - bounds.left,
      height: bounds.bottom - bounds.top,
      transform: `translate(-${POINT_RADIUS / zoom}px, -${
        POINT_RADIUS / zoom
      }px)`,
      transformOrigin: "top left",
    };

    const points = [];

    if (isSelectionMovable(selectedInspectorNodes, rootInspectorNode, graph)) {
      points.push(
        { left: 0, top: 0 },
        { left: 1, top: 0 },
        { left: 0.5, top: 0 },
        { left: 0, top: 0.5 },
        { left: 0, top: 1 }
      );
    }

    if (
      isSelectionResizable(selectedInspectorNodes, rootInspectorNode, graph)
    ) {
      points.push(
        { left: 1, top: 0.5 },
        { left: 1, top: 1 },
        { left: 0.5, top: 1 }
      );
    }

    return (
      <div className="m-resizer-component" tabIndex={-1}>
        <div
          className="m-resizer-component--selection"
          style={resizerStyle as any}
          onMouseDown={onMouseDown}
        >
          <Path
            zoom={zoom}
            points={points}
            bounds={bounds}
            strokeWidth={POINT_STROKE_WIDTH}
            dispatch={dispatch}
            pointRadius={POINT_RADIUS}
          />
        </div>
      </div>
    );
  }
);

export * from "./path";
