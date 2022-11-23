import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";
import { DesignerEngineEvent } from "../engine/designer/events";
import { HistoryEngineEvent } from "../engine/history/events";
import { Box, Point, Size } from "../state/geom";

export const editorEvents = eventCreators(
  {
    canvasPanEnd: null,
    eHotkeyPressed: null,
    deleteHokeyPressed: null,
    insertElementReleased: identity<Box>(),
    canvasMouseMoved: identity<Point>(),
    canvasMouseLeave: null,
    layerLeafClicked: identity<{ virtId: string }>(),
    layerArrowClicked: identity<{ virtId: string }>(),
    canvasMouseUp: null,
    computedStylesCaptured: identity<{
      computedStyles: Record<string, any>;
    }>(),
    canvasMouseDown: identity<{
      metaKey: boolean;
      ctrlKey: boolean;
      shiftKey: boolean;
      timestamp: number;
      position: Point;
    }>(),
    resizerPathMoved: identity<{
      originalBounds: Box;
      newBounds: Box;
    }>(),
    resizerPathStoppedMoving: identity<{
      originalBounds: Box;
      newBounds: Box;
    }>(),
    canvasPanned: identity<{
      delta: Point;
      mousePosition: Point;
      metaKey: boolean;
      ctrlKey: boolean;
      size: Size;
    }>(),
    canvasPanStart: null,
    canvasResized: identity<Size>(),
    rectsCaptured: identity<{
      frameIndex: number;
      rects: Record<string, Box>;
    }>(),
  },
  "editor"
);

export type EditorEvent =
  | ExtractEventFromCreators<typeof editorEvents>
  | DesignerEngineEvent
  | HistoryEngineEvent;
