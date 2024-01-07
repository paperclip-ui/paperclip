import { BaseEvent } from "@paperclip-ui/common";
import { Box, Point, Size } from "../../state/geom";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import {
  DNDKind,
  FSItem,
  InsertMode,
  LayerKind,
  NewFileKind,
  PromptDetails,
  PromptKind,
} from "../../state";
import { ConfirmDetails } from "../../state/confirm";

import { NativeTypes } from "react-dnd-html5-backend";
import { Resource } from "@paperclip-ui/proto/lib/generated/service/designer";

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
export type TriggersEdited = BaseEvent<
  "designer/triggersEdited",
  {
    triggers: UpdateVariantTrigger[];
  }
>;

export type IDChanged = BaseEvent<"ui/idChanged", { value: string }>;
export type IDFieldBlurred = BaseEvent<"ui/IDFieldBlurred">;

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
  }
>;

export type AtomValueChanged = BaseEvent<
  "ui/atomValueChanged",
  {
    value: string;
  }
>;

export type AtomValueChangeCompleted = BaseEvent<
  "ui/atomValueChangeCompleted",
  {
    value: string;
    imports: Record<string, string>;
  }
>;

export type StyleDeclarationsChangeCompleted = BaseEvent<
  "ui/styleDeclarationsChangeCompleted",
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
export type FrameTitleClicked = BaseEvent<
  "ui/frameTitleClicked",
  {
    frameId: string;
  }
>;

type ExprNavigatorDroppedItem =
  | {
      kind: DNDKind.Resource;
      item: Resource;
    }
  | { kind: DNDKind.Node; item: { id: string } }
  | { kind: DNDKind.File; item: FSItem }
  | { kind: typeof NativeTypes.FILE; item: any };
export type ExprNavigatorDroppedNode = BaseEvent<
  "ui/exprNavigatorDroppedNode",
  {
    position: "before" | "after" | "inside";
    targetId: string;
    item: ExprNavigatorDroppedItem;
  }
>;
export type FileNavigatorDroppedFile = BaseEvent<
  "ui/FileNavigatorDroppedFile",
  {
    directory: string;
    item: any;
  }
>;
export type FileNavigatorDroppedNode = BaseEvent<
  "ui/FileNavigatorDroppedNode",
  {
    filePath: string;
    droppedExprId: string;
  }
>;

export type PromptClosed = BaseEvent<
  "ui/promptClosed",
  {
    value?: string;
    details: PromptDetails;
  }
>;
export type ConfirmClosed = BaseEvent<
  "ui/confirmClosed",
  {
    yes: boolean;
    details: ConfirmDetails;
  }
>;
export type ToolsLayerDragOver = BaseEvent<"ui/toolsLayerDragOver", Point>;
export type ToolsLayerDrop = BaseEvent<
  "ui/toolsLayerDrop",
  | { kind: DNDKind; item: any; point: Point }
  | { kind: typeof NativeTypes.FILE; item: any; point: Point }
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

export type AddFileItem = BaseEvent<"ui/AddFileItemClicked", NewFileKind>;

export type EditVariantClicked = BaseEvent<
  "ui/editVariantClicked",
  { variantId: string }
>;

export type ScriptSaved = BaseEvent<
  "ui/scriptSaved",
  { id?: string; src: string; target: string; name: string }
>;

export type ResourceModalDragLeft = BaseEvent<"ui/resourceModalDragLeft">;
export type ResourceModalBackgroundClicked =
  BaseEvent<"ui/resourceModalBackgroundClicked">;
export type EditVariantPopupClosed = BaseEvent<"ui/editVariantPopupClosed">;
export type AddVariantPopupClicked = BaseEvent<"ui/AddVariantPopupClicked">;
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
export type FileNavigatorContextMenuOpened = BaseEvent<
  "ui/FileNavigatorContextMenuOpened",
  FSItem
>;

export type InsertElementReleased = BaseEvent<"ui/insertElementReleased", Box>;
export type LayersBackButtonClicked = BaseEvent<"ui/layersBackButtonClick">;
export type FileFilterFocused = BaseEvent<"ui/fileFilterFocused">;
export type FileFilterBlurred = BaseEvent<"ui/fileFilterBlurred">;
export type CollapseFileNavigatorToggle = BaseEvent<
  "ui/collapseFileNavigatorToggle",
  boolean | undefined
>;

export type UIEvent =
  | ExprNavigatorDroppedNode
  | ElementTagChanged
  | AddVariantPopupClicked
  | FileFilterBlurred
  | DashboardAddFileConfirmed
  | FileFilterFocused
  | ToolsTextEditorChanged
  | CanvasMouseMoved
  | ToolsLayerDragOver
  | AddLayerMenuItemClicked
  | TriggersEdited
  | BoundsChanged
  | CanvasResized
  | LayersBackButtonClicked
  | FrameTitleClicked
  | FileNavigatorContextMenuOpened
  | IDFieldBlurred
  | ToolsLayerDrop
  | PromptClosed
  | FileNavigatorItemClicked
  | CollapseFileNavigatorToggle
  | FileNavigatorDroppedNode
  | ResizerPathMoved
  | ResizerPathStoppedMoving
  | FileNavigatorDroppedFile
  | EditVariantClicked
  | EditVariantPopupClosed
  | ResourceModalDragLeft
  | ResourceModalBackgroundClicked
  | RemoveVariantButtonClicked
  | FileFilterChanged
  | TextValueChanged
  | InsertModeButtonClick
  | StyleDeclarationsChanged
  | InsertElementReleased
  | CanvasMouseLeave
  | RectsCaptured
  | AddFileItem
  | AttributeChanged
  | ConfirmClosed
  | CanvasPanned
  | CanvasPanStart
  | CanvasMouseDown
  | AtomValueChanged
  | AtomValueChangeCompleted
  | StyleDeclarationsChangeCompleted
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
