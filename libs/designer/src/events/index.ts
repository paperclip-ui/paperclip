import {
  BaseEvent,
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { DesignerEngineEvent } from "../domains/api/events";
import { HistoryEngineEvent } from "../domains/history/events";
import { DNDKind, InsertMode } from "../state";
import { Box, Point, Size } from "../state/geom";
import { ShortcutEvent } from "../domains/shortcuts/events";
import { KeyboardEngineEvent } from "../domains/keyboard/events";
import { UIEvent } from "../domains/ui/events";

export type CanvasPanEnd = BaseEvent<"designer/canvasPanEnd">;
export type CanvasMouseUp = BaseEvent<
  "editor/canvasMouseUp",
  {
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    timestamp: number;
    position: Point;
  }
>;
export type VariantSelected = BaseEvent<"designer/variantSelected", string[]>;
export type VariantEdited = BaseEvent<
  "designer/variantEdited",
  {
    componentId: string;
    newName: string;
    triggers: UpdateVariantTrigger[];
  }
>;
export type ToolsLayerDragOver = BaseEvent<
  "designer/ToolsLayerDragOver",
  Point
>;
export type ToolsLayerDrop = BaseEvent<
  "designer/ToolsLayerDrop",
  { kind: DNDKind; item: any; point: Point }
>;

export type ResizerPathStoppedMoving = BaseEvent<
  "editor/resizerPathStoppedMoving",
  {
    originalBounds: Box;
    newBounds: Box;
  }
>;

export type ResizerPathMoved = BaseEvent<
  "editor/resizerPathMoved",
  {
    originalBounds: Box;
    newBounds: Box;
  }
>;

export type EditVariantClicked = BaseEvent<
  "editor/editVariantClicked",
  { variantId: string }
>;

export type ResourceModalDragLeft = BaseEvent<"editor/resourceModalDragLeft">;
export type ResourceModalBackgroundClicked =
  BaseEvent<"editor/resourceModalBackgroundClicked">;
export type EditVariantPopupClosed = BaseEvent<"editor/editVariantPopupClosed">;
export type RemoveVariantButtonClicked = BaseEvent<
  "editor/removeVariantButtonClicked",
  { variantId: string }
>;
export type InsertModeButtonClick = BaseEvent<
  "editor/insertModeButtonClick",
  { mode: InsertMode }
>;
export type InsertElementReleased = BaseEvent<
  "editor/insertElementReleased",
  Box
>;
export type CanvasMouseMoved = BaseEvent<"editor/canvasMouseMoved", Point>;
export type CanvasMouseLeave = BaseEvent<"editor/canvasMouseLeave">;
export type LayerLeafClicked = BaseEvent<
  "editor/layerLeafClicked",
  { virtId: string }
>;
export type LayerArrowClicked = BaseEvent<
  "editor/layerArrowClicked",
  { virtId: string }
>;
export type ComputedStylesCaptured = BaseEvent<
  "editor/computedStylesCaptured",
  {
    computedStyles: Record<string, any>;
  }
>;

export const designerEvents = eventCreators(
  {
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

export type LegacyEvent =
  | CanvasPanEnd
  | VariantEdited
  | VariantSelected
  | ToolsLayerDragOver
  | ToolsLayerDrop
  | CanvasMouseUp
  | ResizerPathMoved
  | ResizerPathStoppedMoving
  | EditVariantClicked
  | EditVariantPopupClosed
  | ResourceModalDragLeft
  | ResourceModalBackgroundClicked
  | RemoveVariantButtonClicked
  | InsertModeButtonClick
  | InsertElementReleased
  | CanvasMouseMoved
  | CanvasMouseLeave
  | LayerLeafClicked
  | LayerArrowClicked
  | ComputedStylesCaptured;

export type DesignerEvent =
  | ExtractEventFromCreators<typeof designerEvents>
  | DesignerEngineEvent
  | HistoryEngineEvent
  | ShortcutEvent
  | KeyboardEngineEvent
  | LegacyEvent
  | UIEvent;
