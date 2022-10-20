import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";
import { InnerVirtNode } from "@paperclip-ui/proto/lib/virt/html";
import { DesignerEngineEvent } from "../engine/designer/events";
import { Box, Point, Size } from "../state/geom";

export const editorEvents = eventCreators(
  {
    canvasPanEnd: null,
    canvasMouseMoved: identity<Point>(),
    canvasMouseLeave: null,
    canvasMouseDown: identity<{
      metaKey: boolean;
      ctrlKey: boolean;
      shiftKey: boolean;
      timestamp: number;
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

    tmpBreadcrumbClicked: identity<InnerVirtNode>(),
  },
  "editor"
);

export type EditorEvent =
  | ExtractEventFromCreators<typeof editorEvents>
  | DesignerEngineEvent;
