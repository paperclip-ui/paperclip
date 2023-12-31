import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  DesignerState,
  findVirtNode,
  getCurrentFilePath,
  getNodeInfoAtCurrentPoint,
  getRenderedFilePath,
  getStyleableTargetId,
  getTargetExprId,
  highlightNode,
  InsertMode,
  newConvertToSlotPrompt,
  redirect,
  resetCurrentDocument,
} from "@paperclip-ui/designer/src/state";
import { centerTransformZoom } from "@paperclip-ui/designer/src/state/geom";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { virtHTML } from "@paperclip-ui/core/lib/proto/virt/html-utils";
import { FileChangedKind } from "@paperclip-ui/proto/lib/generated/service/designer";
import produce from "immer";
import { clamp, mapValues } from "lodash";
import {
  clampCanvasTransform,
  handleDoubleClick,
  handleDragEvent,
  // includeExtraRects,
  MAX_ZOOM,
  maybeCenterCanvas,
  MIN_ZOOM,
  panCanvas,
  PAN_X_SENSITIVITY,
  PAN_Y_SENSITIVITY,
  pruneDanglingRects,
  selectNode,
  zoomCanvas,
  ZOOM_SENSITIVITY,
} from "../state";

export const canvasReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "ui/toolsLayerDragOver": {
      return highlightNode(state, event.payload);
    }
    case "ui/toolsTextEditorChanged": {
      return produce(state, (newState) => {
        newState.showTextEditor = false;
      });
    }
    case "ui/canvasResized":
      return produce(state, (newState) => {
        newState.canvas.size = event.payload;
      });
    case "ui/toolsLayerDrop": {
      return produce(state, (newState) => {
        if (newState.insertMode != InsertMode.Resource) {
          newState.insertMode = null;
        }
        newState.resourceModalDragLeft = false;
        newState.canvas.mouseDown = false;
        newState.canvasMouseDownStartPoint = undefined;
      });
    }
    case "ui/insertModeButtonClick": {
      return produce(state, (newState) => {
        newState.insertMode = event.payload.mode;
      });
    }

    case "designer-engine/serverEvent": {
      // If current file is deleted, then direct to blank screen
      if (event.payload.fileChanged?.kind === FileChangedKind.DELETED) {
        if (
          event.payload.fileChanged.path.includes(getCurrentFilePath(state))
        ) {
          return redirect(state, routes.editor());
        }
      }

      return state;
    }

    case "ui/canvasMouseDown": {
      state = produce(state, (newState) => {
        newState.canvas.mouseDown = true;
        newState.canvas.mousePosition = event.payload.position;
        newState.canvasMouseDownStartPoint = event.payload.position;
        newState.preEditComputedStyles = newState.computedStyles;
      });

      return state;
    }

    case "ui/canvasMouseUp": {
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
        if (getTargetExprId(state)) {
          const node = findVirtNode(getTargetExprId(state), state);

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
    case "ui/canvasPanned": {
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
      const transform = state.canvas.transform;

      state = produce(state, (draft) => {
        draft.canvas.size = size;
        draft.canvas.mousePosition = mousePosition;
      });

      if (metaKey || ctrlKey) {
        state = zoomCanvas(
          transform.z + (transform.z * -deltaY) / ZOOM_SENSITIVITY,
          state
        );
      } else {
        state = panCanvas(
          {
            x: transform.x - delta2X,
            y: transform.y - delta2Y,
          },
          state
        );
      }

      return state;
    }

    case "ui/canvasMouseMoved": {
      return highlightNode(state, event.payload);
    }

    case "ui/resizerPathStoppedMoving": {
      return handleDragEvent({ ...state, resizerMoving: false }, event);
    }
    case "ui/resizerPathMoved": {
      return handleDragEvent({ ...state, resizerMoving: true }, event);
    }
    case "ui/atomValueChanged": {
      return produce(state, (draft) => {
        draft.atomOverrides[getStyleableTargetId(state)] = event.payload.value;
      });
    }
    case "ui/styleDeclarationsChangeCompleted":
    case "ui/styleDeclarationsChanged": {
      return produce(state, (draft) => {
        draft.styleOverrides[getStyleableTargetId(state)] = Object.assign(
          {},
          draft.styleOverrides[getStyleableTargetId(state)],
          event.payload.values
        );
      });
    }
    case "designer-engine/documentOpened": {
      if (getCurrentFilePath(state) !== getRenderedFilePath(state)) {
        state = resetCurrentDocument(state);
      }
      state = produce(state, (draft) => {
        draft.styleOverrides = {};
        draft.atomOverrides = {};
      });

      state = maybeCenterCanvas(state);
      return state;
    }

    case "ui/rectsCaptured":
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

    case "ui/computedStylesCaptured":
      return produce(state, (newState) => {
        Object.assign(newState.computedStyles, event.payload);
      });
  }
  return state;
};
