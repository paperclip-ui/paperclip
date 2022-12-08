import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { DesignerEngineEvent } from "../domains/api/events";
import { HistoryEngineEvent } from "../domains/history/events";
import { InsertMode } from "../state";
import { Box, Point, Size } from "../state/geom";
import { ShortcutEvent } from "../domains/shortcuts/events";
import { KeyboardEvent } from "../domains/keyboard/events";

export const designerEvents = eventCreators(
  {
    canvasPanEnd: null,
    variantsSelected: identity<string[]>(),
    variantEdited: identity<{
      componentId: string;
      newName: string;
      triggers: UpdateVariantTrigger[];
    }>(),
    editVariantClicked: identity<{ variantId: string }>(),
    editVariantPopupClosed: null,
    removeVariantButtonClicked: identity<{ variantId: string }>(),
    insertModeButtonClick: identity<{ mode: InsertMode }>(),
    insertElementReleased: identity<Box>(),
    canvasMouseMoved: identity<Point>(),
    canvasMouseLeave: null,
    layerLeafClicked: identity<{ virtId: string }>(),
    layerArrowClicked: identity<{ virtId: string }>(),
    canvasMouseUp: null,
    computedStylesCaptured: identity<{
      computedStyles: Record<string, any>;
    }>(),
    styleDeclarationsChanged: identity<{
      values: Record<string, string>;
      imports: Record<string, string>;
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

export type DesignerEvent =
  | ExtractEventFromCreators<typeof designerEvents>
  | DesignerEngineEvent
  | HistoryEngineEvent
  | ShortcutEvent
  | KeyboardEvent;
