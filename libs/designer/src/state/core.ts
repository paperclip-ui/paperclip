import { FileResponse } from "@paperclip-ui/proto/lib/generated/service/designer";
import { Box, Point, Size, Transform } from "./geom";

import {
  HistoryEngineState,
  INITIAL_HISTORY_STATE,
} from "../domains/history/state";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { WritableDraft } from "immer/dist/internal";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";

export const IS_WINDOWS = false;

export enum InsertMode {
  Element,
  Text,
  Resource,
}

export enum LayerKind {
  Text = "Text",
  Atom = "Atom",
  Element = "Element",
  Trigger = "Trigger",
  Style = "Style",
  Component = "Component",
}

export enum DNDKind {
  Resource = "Resource",
  Node = "Node",
}

export type Canvas = {
  size: Size;
  transform: Transform;
  isExpanded?: boolean;
  activeFrame?: number;
  scrollPosition: Point;
  mousePosition?: Point;
  mouseDown?: boolean;
};

export type BoxNodeInfo = {
  nodeId: string;
  box: Box;
};

export type StyleOverrides = Record<string, Record<string, string | number>>;

type Query = {
  file?: string;
};

export type FrameBox = { frameIndex: number } & Box;

export enum FSItemKind {
  Directory = "Directory",
  File = "File",
}

type BaseFSItem<Kind extends FSItemKind> = {
  kind: Kind;
  path: string;
};

export type FSDirectory = BaseFSItem<FSItemKind.Directory> & {
  items: FSItem[];
};

export type FSFile = BaseFSItem<FSItemKind.File>;

export type FSItem = FSDirectory | FSFile;

export type DesignerState = {
  readonly: boolean;
  scopedElementId?: string;
  projectDirectory?: FSDirectory;
  activeVariantId?: string;
  selectedVariantIds: string[];
  renderedFilePath?: string;
  insertedNodeIds: string[];
  graph: Graph;
  insertMode?: InsertMode;
  resourceFilePaths: string[];
  showLeftSidebar: boolean;
  resourceModalDragLeft: boolean;
  showRightsidebar: boolean;
  highlightedNodeId?: string;
  screenshotUrls: Record<string, string>;

  // temporary style overrides of canvas elements when elements are manipulated
  // such as resizing
  styleOverrides: StyleOverrides;
  canvasClickTimestamp?: number;
  canvasMouseDownStartPoint?: Point;
  expandedLayerVirtIds: string[];
  showTextEditor?: boolean;
  resizerMoving: boolean;
  expandedNodePaths: string[];
  preEditComputedStyles: Record<string, CSSStyleDeclaration>;
  computedStyles: Record<string, CSSStyleDeclaration>;
  optionKeyDown: boolean;
  centeredInitial: boolean;
  currentDocument?: FileResponse;
  rects: Record<string, FrameBox>;
  canvas: Canvas;
} & HistoryEngineState;

export const DEFAULT_STATE: DesignerState = {
  readonly: false,
  selectedVariantIds: [],
  resourceFilePaths: [],
  styleOverrides: {},
  preEditComputedStyles: {},
  resourceModalDragLeft: false,
  graph: {
    dependencies: {},
  },
  showLeftSidebar: true,
  showRightsidebar: true,
  expandedLayerVirtIds: [],
  computedStyles: {},
  resizerMoving: false,
  screenshotUrls: {},
  insertedNodeIds: [],
  optionKeyDown: false,
  scopedElementId: null,
  expandedNodePaths: [],
  centeredInitial: false,
  canvas: {
    transform: { x: 0, y: 0, z: 1 },
    scrollPosition: { x: 0, y: 0 },
    size: {
      width: 0,
      height: 0,
    },
  },
  rects: {},
  ...INITIAL_HISTORY_STATE,
};

export const getCanvas = (editor: DesignerState) => editor.canvas;

export const getCurrentFilePath = (state: DesignerState) => {
  return state.history?.query.file;
};
export const getRenderedFilePath = (state: DesignerState) => {
  return state.renderedFilePath;
};
export const getTargetExprId = (state: DesignerState) => {
  return state.history?.query.nodeId;
};
export const setTargetExprId = (
  state: WritableDraft<DesignerState>,
  nodeId: string
) => {
  state.history.query.nodeId = nodeId;

  if (nodeId != null) {
    const exprPath = ast.getOwnerDependencyPath(nodeId, state.graph);
    if (exprPath != null) {
      state.history.query.file = exprPath;
    }
  }
};

export const getEditorState = (state: DesignerState) => state;

export const isResourceModalVisible = (state: DesignerState) =>
  state.insertMode === InsertMode.Resource && !state.resourceModalDragLeft;

export const getScreenshotUrls = (state: DesignerState) => state.screenshotUrls;

export const getResourceFilePaths = (state: DesignerState) =>
  state.resourceFilePaths;

export const resetCurrentDocument = (state: DesignerState): DesignerState => ({
  ...state,
  currentDocument: null,
  rects: {},
  computedStyles: {},
  // selectedTargetId: null,
  centeredInitial: false,
  highlightedNodeId: null,
  preEditComputedStyles: {},
  canvas: {
    transform: { x: 0, y: 0, z: 1 },
    scrollPosition: { x: 0, y: 0 },
    size: state.canvas.size,
  },
});
