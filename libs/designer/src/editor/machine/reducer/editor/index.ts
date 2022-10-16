import { designerEngineEvents } from "../../engine/designer/events";
import { EditorEvent, editorEvents } from "../../events";
import {
  Canvas,
  EditorState,
  flattenFrameBoxes,
  IS_WINDOWS,
  maybeCenterCanvas,
} from "../../state";
import produce from "immer";
import { clamp } from "lodash";
import { Box, centerTransformZoom } from "../../state/geom";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 6400 / 100;
const DOUBLE_CLICK_MS = 250;

export const editorReducer = (
  state: EditorState,
  event: EditorEvent
): EditorState => {
  switch (event.type) {
    case designerEngineEvents.documentOpened.type:
      state = produce(state, (newState) => {
        newState.curentDocument = event.payload.toObject();
      });
      state = maybeCenterCanvas(state);
      return state;
    case editorEvents.canvasResized.type:
      return produce(state, (newState) => {
        newState.canvas.size = event.payload;
      });
    case editorEvents.canvasPanned.type: {
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
          newState.canvas.transform.x = transform.x - delta2X; // clamp(transform.x - delta2X, 0, size.width * transform.z - size.width);
          newState.canvas.transform.y = transform.y - delta2Y; // clamp(transform.y - delta2Y, 0, size.height * transform.z - size.height);
        }
        Object.assign(
          newState.canvas,
          clampCanvasTransform(
            newState.canvas,
            flattenFrameBoxes(newState.rects)
          )
        );
      });
    }
    case editorEvents.rectsCaptured.type:
      state = produce(state, (newState) => {
        newState.rects[event.payload.frameIndex] = event.payload.rects;
      });

      state = maybeCenterCanvas(state);
      return state;
  }
  return state;
};

const clampCanvasTransform = (canvas: Canvas, rects: Record<string, Box>) => {
  return produce(canvas, (newCanvas) => {
    const w = (canvas.size.width / MIN_ZOOM) * canvas.transform.z;
    const h = (canvas.size.height / MIN_ZOOM) * canvas.transform.z;

    newCanvas.transform.x = clamp(newCanvas.transform.x, -w, w);

    newCanvas.transform.y = clamp(newCanvas.transform.y, -h, w);
  });
};
