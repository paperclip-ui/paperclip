import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  clampCanvasTransform,
  DesignerState,
  getNodeInfoAtCurrentPoint,
  handleDoubleClick,
  handleDragEvent,
  highlightNode,
  InsertMode,
  MAX_ZOOM,
  maybeCenterCanvas,
  MIN_ZOOM,
  PAN_X_SENSITIVITY,
  PAN_Y_SENSITIVITY,
  pruneDanglingRects,
  selectNode,
  ZOOM_SENSITIVITY,
} from "@paperclip-ui/designer/src/state";
import { centerTransformZoom } from "@paperclip-ui/designer/src/state/geom";
import { virtHTML } from "@paperclip-ui/proto/lib/virt/html-utils";
import produce from "immer";
import { clamp, mapValues } from "lodash";

export const canvasReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "editor/canvasResized":
      return produce(state, (newState) => {
        newState.canvas.size = event.payload;
      });

    case "designer/ToolsLayerDrop": {
      return produce(state, (newState) => {
        if (newState.insertMode != InsertMode.Resource) {
          newState.insertMode = null;
        }
        newState.resourceModalDragLeft = false;
        newState.canvas.mouseDown = false;
        newState.canvasMouseDownStartPoint = undefined;
      });
    }

    case "editor/insertModeButtonClick": {
      return produce(state, (newState) => {
        newState.insertMode = event.payload.mode;
      });
    }

    case "editor/canvasMouseDown": {
      state = produce(state, (newState) => {
        newState.canvas.mouseDown = true;
        newState.canvas.mousePosition = event.payload.position;
        newState.canvasMouseDownStartPoint = event.payload.position;
        newState.preEditComputedStyles = newState.computedStyles;
      });

      return state;
    }

    case "editor/canvasMouseUp": {
      state = produce(state, (newState) => {
        if (newState.insertMode === InsertMode.Text) {
          newState.showTextEditor = true;
        }
        if (newState.insertMode != InsertMode.Resource) {
          newState.insertMode = null;
        }
        newState.resourceModalDragLeft = false;
        newState.canvas.mouseDown = false;
        newState.canvasMouseDownStartPoint = undefined;
      });

      if (state.resizerMoving) {
        return state;
      }

      if (!state.canvas.transform || state.canvas.mousePosition?.x == null) {
        return state;
      }

      let doubleClicked;

      [state, doubleClicked] = handleDoubleClick(state, event);

      if (doubleClicked) {
        if (state.selectedTargetId) {
          const node = virtHTML.getNodeById(
            state.selectedTargetId,
            state.currentDocument.paperclip.html
          );

          if (node && virtHTML.isTextNode(node)) {
            state = produce(state, (newDesigner) => {
              newDesigner.showTextEditor = true;
            });
          }
        }
        return state;
      }

      // Don't do this until deselecting can be handled properly
      const nodeId = getNodeInfoAtCurrentPoint(state)?.nodeId;

      return selectNode(
        nodeId,
        event.payload.shiftKey,
        event.payload.metaKey,
        state
      );
    }
    case "editor/canvasPanned": {
      // do not allow panning when expanded
      if (state.canvas.isExpanded) {
        return state;
      }

      const {
        delta: { x: deltaX, y: deltaY },
        metaKey,
        ctrlKey,
        mousePosition,
        size,
      } = event.payload;

      const delta2X = deltaX * PAN_X_SENSITIVITY;
      const delta2Y = deltaY * PAN_Y_SENSITIVITY;

      return produce(state, (newState) => {
        const transform = newState.canvas.transform;

        if (metaKey || ctrlKey) {
          newState.canvas.transform = centerTransformZoom(
            newState.canvas.transform,
            {
              x: 0,
              y: 0,
              width: size.width,
              height: size.height,
            },
            clamp(
              transform.z + (transform.z * -deltaY) / ZOOM_SENSITIVITY,
              MIN_ZOOM,
              MAX_ZOOM
            ),
            mousePosition
          );
        } else {
          newState.canvas.transform.x = transform.x - delta2X;
          newState.canvas.transform.y = transform.y - delta2Y;
        }

        Object.assign(
          newState.canvas,
          clampCanvasTransform(newState.canvas, newState.rects)
        );
      });
    }

    case "editor/canvasMouseMoved": {
      return highlightNode(state, event.payload);
    }

    case "editor/resizerPathStoppedMoving": {
      return handleDragEvent({ ...state, resizerMoving: false }, event);
    }
    case "editor/resizerPathMoved": {
      return handleDragEvent({ ...state, resizerMoving: true }, event);
    }

    case "editor/rectsCaptured":
      state = produce(state, (newState) => {
        Object.assign(
          newState.rects,
          mapValues(event.payload.rects, (rect) => ({
            frameIndex: event.payload.frameIndex,
            ...rect,
          }))
        );
      });
      state = pruneDanglingRects(state);
      state = maybeCenterCanvas(state);
      return state;

    case "editor/computedStylesCaptured":
      return produce(state, (newState) => {
        Object.assign(newState.computedStyles, event.payload.computedStyles);
      });
  }
  return state;
};
