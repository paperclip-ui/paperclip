import {
  FileResponse,
  ProjectInfo,
  Resource,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { Box, Point, Size, Transform } from "./geom";

import {
  HistoryEngineState,
  INITIAL_HISTORY_STATE,
} from "../domains/history/state";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { WritableDraft } from "immer/dist/internal";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import produce from "immer";
import { uniq } from "lodash";
import { Prompt } from "./prompt";
import { Confirm } from "./confirm";
import { getSelectedVariantIds } from "./pc";

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

export enum NewFileKind {
  DesignFile = "DesignFile",
  Directory = "Directory",
}

export enum DNDKind {
  Resource = "Resource",
  Node = "Node",
  File = "File",
}

export type Canvas = {
  size: Size;
  transform: Transform;
  isExpanded?: boolean;
  scrollPosition: Point;
  activeFrame?: number;
  mousePosition?: Point;
  mouseDown?: boolean;
};

export type BoxNodeInfo = {
  nodeId: string;
  box: Box;
};

export type StyleOverrides = Record<string, Record<string, string | number>>;
export type AtomOverrides = Record<string, string>;

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
  centerOnRedirect?: boolean;
  cuttingId?: string;
  projectInfo?: ProjectInfo;
  editVariantPopupOpen?: boolean;
  renderedFilePath?: string;
  insertedNodeIds: string[];
  graph: Graph;
  insertMode?: InsertMode;
  focusOnFileSearch?: boolean;
  resourceFilePaths: string[];
  searchedResources?: Resource[];
  selectedFilePath: string;
  expandedDirs?: string[];
  searchedFilePathRoot?: string;
  showLeftSidebar: boolean;
  resourceModalDragLeft: boolean;
  prompt?: Prompt;
  confirm?: Confirm;
  showRightsidebar: boolean;
  highlightedNodeId?: string;
  screenshotUrls: Record<string, string>;

  // temporary style overrides of canvas elements when elements are manipulated
  // such as resizing
  styleOverrides: StyleOverrides;
  atomOverrides: AtomOverrides;
  canvasClickTimestamp?: number;
  canvasMouseDownStartPoint?: Point;
  expandedLayerVirtIds: string[];
  showTextEditor?: boolean;
  resizerMoving: boolean;
  fileFilter?: string;
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
  resourceFilePaths: [],
  styleOverrides: {},
  atomOverrides: {},
  preEditComputedStyles: {},
  resourceModalDragLeft: false,
  graph: {
    dependencies: {},
  },
  selectedFilePath: INITIAL_HISTORY_STATE.history.query.file,
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

export const getSelectedDeclName = (state: DesignerState) => {
  return state.history?.query.declName;
};
export const getSelectedFilePath = (state: DesignerState) => {
  return state.selectedFilePath;
};
export const getRenderedFilePath = (state: DesignerState) => {
  return state.renderedFilePath;
};
export const getTargetExprId = (state: DesignerState) => {
  return state.history?.query.nodeId;
};

export const canDefineVariantForExprId = (
  exprId: string,
  state: DesignerState | WritableDraft<DesignerState>
) => {
  const selectedVariantId = getSelectedVariantIds(state as DesignerState)[0];
  if (!selectedVariantId) {
    return false;
  }
  const selectedVariant = ast.getExprInfoById(selectedVariantId, state.graph);
  const expr = ast.getExprInfoById(exprId, state.graph);
  const ownerComponent = ast.getExprOwnerComponent(
    selectedVariant.expr,
    state.graph
  );

  return (
    ownerComponent &&
    ast.getExprOwnerComponent(expr.expr, state.graph)?.id === ownerComponent?.id
  );
};

export const setTargetExprId = (
  state: WritableDraft<DesignerState>,
  nodeId: string
) => {
  state.redirect = {
    ...state.history,
    query: {
      ...state.history.query,
    },
  };

  if (nodeId) {
    state.redirect.query.nodeId = nodeId;
  } else {
    delete state.redirect.query.nodeId;
  }

  // deselect variant ids if they're selected
  if (!canDefineVariantForExprId(nodeId, state)) {
    delete state.redirect.query.variantIds;
  }

  if (nodeId != null) {
    const exprPath = ast.getOwnerDependencyPath(nodeId, state.graph);
    if (exprPath != null) {
      state.redirect.query.file = exprPath;
    }
  }
};

export const getEditorState = (state: DesignerState) => state;
export const getHistoryStr = (state: DesignerState) => {
  let path = state.history.pathname;
  if (Object.keys(state.history.query).length) {
    path += "?" + new URLSearchParams(state.history.query).toString();
  }
  return path;
};

export const isResourceModalVisible = (state: DesignerState) =>
  state.insertMode === InsertMode.Resource && !state.resourceModalDragLeft;

export const getScreenshotUrls = (state: DesignerState) => state.screenshotUrls;

export const getResourceFilePaths = (state: DesignerState) =>
  state.resourceFilePaths;

export const resetCurrentDocument = (
  state: DesignerState | WritableDraft<DesignerState>
): DesignerState => ({
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

export const getFileFilter = (state: DesignerState) => state.fileFilter;
export const getFocusOnFileFilter = (state: DesignerState) =>
  state.focusOnFileSearch;

export const getSearchedFiles = (state: DesignerState) =>
  state.searchedResources || [];
export const getSearchedFilesRoot = (state: DesignerState) =>
  state.searchedFilePathRoot;

export const redirect = (state: DesignerState, path: string) => {
  const parts = new URL("http://localhost" + path);

  return produce(state, (newState) => {
    newState.redirect = {
      pathname: parts.pathname,
      query: Object.fromEntries(new URLSearchParams(parts.search)),
    };
  });
};

export const selectFilePath =
  (filePath: string) => (state: WritableDraft<DesignerState>) => {
    state.selectedFilePath = filePath;
    expandDirs(filePath)(state);
  };

export const expandDirs =
  (top: string) => (state: WritableDraft<DesignerState>) => {
    state.expandedDirs = uniq([
      ...(state.expandedDirs || []),
      ...top.split("/").map((_, i, arr) => arr.slice(0, i + 1).join("/")),
    ]);
  };

export const getActiveFilePath = (state: DesignerState) =>
  state.selectedFilePath || state.projectDirectory?.path;

export const getActiveRelativeDirectory = (state: DesignerState) => {
  const activeFilePath = getActiveFilePath(state);
  if (!activeFilePath) {
    return null;
  }
  const parts = activeFilePath.split("/");
  return parts[parts.length - 1].includes(".")
    ? parts.slice(0, -1).join("/")
    : activeFilePath;
};
