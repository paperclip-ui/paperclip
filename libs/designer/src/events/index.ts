import { BaseEvent } from "@paperclip-ui/common";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { DesignerEngineEvent } from "../domains/api/events";
import { HistoryEngineEvent } from "../domains/history/events";
import { DNDKind, InsertMode } from "../state";
import { Box, Point, Size } from "../state/geom";
import { ShortcutEvent } from "../domains/shortcuts/events";
import { KeyboardEngineEvent } from "../domains/keyboard/events";
import { UIEvent } from "../domains/ui/events";
import { ClipboardEvent } from "../domains/clipboard/events";

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
export type InstanceVariantToggled = BaseEvent<
  "designer/instanceVariantToggled",
  string
>;
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

export type BoundsChanged = BaseEvent<
  "designer/boundsChanged",
  {
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

export type StyleDeclarationsChanged = BaseEvent<
  "editor/styleDeclarationsChanged",
  {
    values: Record<string, string>;
    imports: Record<string, string>;
  }
>;

export type ElementTagChanged = BaseEvent<
  "editor/elementTagChanged",
  {
    newTagName: string;
  }
>;
export type ExprNavigatorDroppedNode = BaseEvent<
  "editor/exprNavigatorDroppedNode",
  {
    position: "before" | "after" | "inside";
    targetId: string;
    droppedExprId: string;
  }
>;

export type CanvasMouseDown = BaseEvent<
  "editor/canvasMouseDown",
  {
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    timestamp: number;
    position: Point;
  }
>;

export type CanvasPanned = BaseEvent<
  "editor/canvasPanned",
  {
    delta: Point;
    mousePosition: Point;
    metaKey: boolean;
    ctrlKey: boolean;
    size: Size;
  }
>;

export type CanvasPanStart = BaseEvent<"editor/canvasPanStart">;
export type CanvasResized = BaseEvent<"editor/canvasResized", Size>;
export type RectsCaptured = BaseEvent<
  "editor/rectsCaptured",
  {
    frameIndex: number;
    rects: Record<string, Box>;
  }
>;

export type LegacyEvent =
  | CanvasPanEnd
  | CanvasPanned
  | CanvasPanStart
  | CanvasMouseDown
  | CanvasResized
  | RectsCaptured
  | StyleDeclarationsChanged
  | ExprNavigatorDroppedNode
  | VariantEdited
  | ElementTagChanged
  | VariantSelected
  | ToolsLayerDragOver
  | ToolsLayerDrop
  | CanvasMouseUp
  | InstanceVariantToggled
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
  | DesignerEngineEvent
  | HistoryEngineEvent
  | BoundsChanged
  | ClipboardEvent
  | ShortcutEvent
  | KeyboardEngineEvent
  | LegacyEvent
  | UIEvent;
