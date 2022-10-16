import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";
import { DesignerEngineEvent } from "../engine/designer/events";
import { Point, Size } from "../state/geom";

export const editorEvents = eventCreators(
  {
    canvasPanEnd: null,
    canvasPanned: identity<{
      delta: Point;
      mousePosition: Point;
      metaKey: boolean;
      ctrlKey: boolean;
      size: Size;
    }>(),
    canvasPanStart: null,
    canvasResized: identity<Size>(),
  },
  "editor"
);

export type EditorEvent =
  | ExtractEventFromCreators<typeof editorEvents>
  | DesignerEngineEvent;
