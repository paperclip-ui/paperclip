import { BaseEvent } from "@paperclip-ui/common";
import { Box, Point, Size } from "../../state/geom";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { DNDKind, FSItem, InsertMode, LayerKind } from "../../state";

export type DashboardAddFileConfirmed = BaseEvent<
  "ui/dashboardAddFileConfirmed",
  { name: string }
>;

export type ToolsTextEditorChanged = BaseEvent<
  "ui/toolsTextEditorChanged",
  { text: string }
>;
export type CanvasPanEnd = BaseEvent<"ui/canvasPanEnd">;

export type CanvasMouseUp = BaseEvent<
  "ui/canvasMouseUp",
  {
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    timestamp: number;
    position: Point;
  }
>;
export type VariantSelected = BaseEvent<"ui/variantSelected", string[]>;
export type InstanceVariantToggled = BaseEvent<
  "designer/instanceVariantToggled",
  string
>;
export type StyleMixinsSet = BaseEvent<"designer/styleMixinsSet", string[]>;
export type VariantEdited = BaseEvent<
  "designer/variantEdited",
  {
    componentId: string;
    newName: string;
    triggers: UpdateVariantTrigger[];
  }
>;

export type IDChanged = BaseEvent<"ui/idChanged", { value: string }>;

export type CanvasResized = BaseEvent<"ui/canvasResized", Size>;
export type RectsCaptured = BaseEvent<
  "ui/rectsCaptured",
  {
    frameIndex: number;
    rects: Record<string, Box>;
  }
>;

export type CanvasMouseDown = BaseEvent<
  "ui/canvasMouseDown",
  {
    metaKey: boolean;
    ctrlKey: boolean;
    shiftKey: boolean;
    timestamp: number;
    position: Point;
  }
>;

export type CanvasPanned = BaseEvent<
  "ui/canvasPanned",
  {
    delta: Point;
    mousePosition: Point;
    metaKey: boolean;
    ctrlKey: boolean;
    size: Size;
  }
>;

export type AttributeChanged = BaseEvent<
  "ui/attributeChanged",
  {
    attributeId?: string;
    name: string;
    value: string;
  }
>;

export type LayerLeafClicked = BaseEvent<
  "ui/layerLeafClicked",
  { virtId: string }
>;
export type LayerArrowClicked = BaseEvent<
  "ui/layerArrowClicked",
  { virtId: string }
>;
export type ComputedStylesCaptured = BaseEvent<
  "ui/computedStylesCaptured",
  {
    computedStyles: Record<string, any>;
  }
>;

export type StyleDeclarationsChanged = BaseEvent<
  "ui/styleDeclarationsChanged",
  {
    values: Record<string, string>;
    imports: Record<string, string>;
  }
>;

export type CanvasPanStart = BaseEvent<"ui/canvasPanStart">;

export type CanvasMouseMoved = BaseEvent<"ui/canvasMouseMoved", Point>;
export type TextValueChanged = BaseEvent<"ui/textValueChanged", string>;
export type CanvasMouseLeave = BaseEvent<"ui/canvasMouseLeave">;
export type ElementTagChanged = BaseEvent<
  "ui/elementTagChanged",
  {
    tagName: string;
    sourceFilePath?: string;
  }
>;
export type ExprNavigatorDroppedNode = BaseEvent<
  "ui/exprNavigatorDroppedNode",
  {
    position: "before" | "after" | "inside";
    targetId: string;
    droppedExprId: string;
  }
>;

export type ToolsLayerDragOver = BaseEvent<"ui/toolsLayerDragOver", Point>;
export type ToolsLayerDrop = BaseEvent<
  "ui/toolsLayerDrop",
  { kind: DNDKind; item: any; point: Point }
>;

export type ResizerPathStoppedMoving = BaseEvent<
  "ui/resizerPathStoppedMoving",
  {
    originalBounds: Box;
    newBounds: Box;
  }
>;

export type ResizerPathMoved = BaseEvent<
  "ui/resizerPathMoved",
  {
    originalBounds: Box;
    newBounds: Box;
  }
>;

export type BoundsChanged = BaseEvent<
  "ui/boundsChanged",
  {
    newBounds: Box;
  }
>;

export type AddLayerMenuItemClicked = BaseEvent<
  "ui/AddLayerMenuItemClicked",
  LayerKind
>;

export type EditVariantClicked = BaseEvent<
  "ui/editVariantClicked",
  { variantId: string }
>;

export type ResourceModalDragLeft = BaseEvent<"ui/resourceModalDragLeft">;
export type ResourceModalBackgroundClicked =
  BaseEvent<"ui/resourceModalBackgroundClicked">;
export type EditVariantPopupClosed = BaseEvent<"ui/editVariantPopupClosed">;
export type RemoveVariantButtonClicked = BaseEvent<
  "ui/removeVariantButtonClicked",
  { variantId: string }
>;
export type InsertModeButtonClick = BaseEvent<
  "ui/insertModeButtonClick",
  { mode: InsertMode }
>;

export type FileFilterChanged = BaseEvent<"ui/fileFilterChanged", string>;

export type FileNavigatorItemClicked = BaseEvent<
  "ui/FileNavigatorItemClicked",
  FSItem
>;

export type InsertElementReleased = BaseEvent<"ui/insertElementReleased", Box>;

export type UIEvent =
  | ExprNavigatorDroppedNode
  | ElementTagChanged
  | DashboardAddFileConfirmed
  | ToolsTextEditorChanged
  | CanvasMouseMoved
  | ToolsLayerDragOver
  | AddLayerMenuItemClicked
  | BoundsChanged
  | CanvasResized
  | ToolsLayerDrop
  | FileNavigatorItemClicked
  | ResizerPathMoved
  | ResizerPathStoppedMoving
  | EditVariantClicked
  | EditVariantPopupClosed
  | ResourceModalDragLeft
  | ResourceModalBackgroundClicked
  | RemoveVariantButtonClicked
  | FileFilterChanged
  | TextValueChanged
  | InsertModeButtonClick
  | InsertElementReleased
  | CanvasMouseLeave
  | RectsCaptured
  | AttributeChanged
  | CanvasPanned
  | CanvasPanStart
  | CanvasMouseDown
  | StyleDeclarationsChanged
  | LayerLeafClicked
  | LayerArrowClicked
  | ComputedStylesCaptured
  | CanvasPanEnd
  | VariantEdited
  | VariantSelected
  | CanvasMouseUp
  | InstanceVariantToggled
  | StyleMixinsSet
  | CanvasPanEnd
  | IDChanged;
