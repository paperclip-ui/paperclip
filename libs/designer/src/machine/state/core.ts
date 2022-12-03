import { FileResponse } from "@paperclip-ui/proto/lib/generated/service/designer";
import { pickBy } from "lodash";
import {
  Node,
  Document as HTMLDocument,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { DesignerEngineState } from "../engine/designer/state";
import {
  Box,
  boxIntersectsPoint,
  centerTransformZoom,
  getScaledPoint,
  mergeBoxes,
  Point,
  Size,
  Transform,
} from "./geom";
import { memoize } from "@paperclip-ui/common";
import { virtHTML } from "@paperclip-ui/proto/lib/virt/html-utils";
import {
  HistoryEngineState,
  INITIAL_HISTORY_STATE,
} from "../engine/history/state";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
export const IS_WINDOWS = false;

export enum InsertMode {
  Element,
  Text,
}

export type Canvas = {
  size?: Size;
  transform: Transform;
  isExpanded?: boolean;
  activeFrame?: number;
  scrollPosition: Point;
  mousePosition?: Point;
  mouseDown?: boolean;
};

export type BoxNodeInfo = {
  nodePath: string;
  box: Box;
};

export const DEFAULT_FRAME_BOX = {
  width: 1024,
  height: 768,
  x: 0,
  y: 0,
};
const INITIAL_ZOOM_PADDING = 50;

export type StyleOverrides = Record<string, Record<string, string | number>>;

type Query = {
  file?: string;
};

export type EditorState = {
  readonly: boolean;
  scopedElementPath?: string;
  selectedVirtNodeIds: string[];
  graph: Graph;
  insertMode?: InsertMode;
  highlightNodePath?: string;

  // temporary style overrides of canvas elements when elements are manipulated
  // such as resizing
  styleOverrides: StyleOverrides;
  // selectedNodeStyleInspections: any[];
  // selectedNodeSources: any[];
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
  rects: Record<number, Record<string, Box>>;
  canvas: Canvas;
} & DesignerEngineState &
  HistoryEngineState;

export const DEFAULT_STATE: EditorState = {
  readonly: false,
  styleOverrides: {},
  preEditComputedStyles: {},
  graph: {
    dependencies: {},
  },
  expandedLayerVirtIds: [],
  computedStyles: {},
  resizerMoving: false,
  optionKeyDown: false,
  scopedElementPath: null,
  expandedNodePaths: [],
  centeredInitial: false,
  selectedVirtNodeIds: [],
  canvas: {
    transform: { x: 0, y: 0, z: 1 },
    scrollPosition: { x: 0, y: 0 },
  },
  rects: {},
  ...INITIAL_HISTORY_STATE,
};

export const getCurrentDocument = (state: EditorState) => state.currentDocument;

export const maybeCenterCanvas = (editor: EditorState, force?: boolean) => {
  if (
    force ||
    (!editor.centeredInitial &&
      editor.canvas.size?.width &&
      editor.canvas.size?.height)
  ) {
    editor = { ...editor, centeredInitial: true };

    let targetBounds: Box;
    const currentFrameIndex = editor.canvas.activeFrame;

    if (currentFrameIndex != null) {
      const frameBoxes = getPreviewFrameBoxes(
        editor.currentDocument?.paperclip?.html
      );
      targetBounds = frameBoxes[currentFrameIndex];
    }

    editor = centerEditorCanvas(editor, targetBounds);

    return editor;
  }
  return editor;
};

// https://github.com/crcn/tandem/blob/10.0.0/packages/dashboard/src/state/index.ts#L1304
export const centerEditorCanvas = (
  editor: EditorState,
  innerBounds?: Box,
  zoomOrZoomToFit: boolean | number = true
) => {
  if (!innerBounds) {
    innerBounds = getAllFrameBounds(editor);
  }

  // no windows loaded
  if (
    innerBounds.x + innerBounds.y + innerBounds.width + innerBounds.height ===
    0
  ) {
    console.warn(` Cannot center when bounds has no size`);
    return editor;
  }

  const {
    canvas: {
      transform,
      size: { width, height },
    },
  } = editor;

  const centered = {
    x: -innerBounds.x + width / 2 - innerBounds.width / 2,
    y: -innerBounds.y + height / 2 - innerBounds.height / 2,
  };

  const scale =
    typeof zoomOrZoomToFit === "boolean"
      ? Math.min(
          (width - INITIAL_ZOOM_PADDING) / innerBounds.width,
          (height - INITIAL_ZOOM_PADDING) / innerBounds.height
        )
      : typeof zoomOrZoomToFit === "number"
      ? zoomOrZoomToFit
      : transform.z;

  editor = {
    ...editor,
    canvas: {
      ...editor.canvas,
      transform: centerTransformZoom(
        {
          ...centered,
          z: 1,
        },
        {
          x: 0,
          y: 0,
          width,
          height,
        },
        Math.min(scale, 1)
      ),
    },
  };

  return editor;
};

const getAllFrameBounds = (designer: EditorState) => {
  return mergeBoxes(getCurrentPreviewFrameBoxes(designer));
};
export const getSelectedNodePaths = (designer: EditorState) => {
  return getSelectedNodeIds(designer).map((id) => {
    const node = virtHTML.getNodeById(
      id,
      designer.currentDocument.paperclip.html
    );
    return virtHTML.getNodePath(node, designer.currentDocument.paperclip.html);
  });
};
export const getSelectedNodeIds = (designer: EditorState) => {
  return designer.selectedVirtNodeIds;
};
export const getHighlightedNodePath = (designer: EditorState) =>
  designer.highlightNodePath;
export const getResizerMoving = (designer: EditorState) =>
  designer.resizerMoving;
export const getEditorState = (designer: EditorState) => designer;

export const getCurrentPreviewFrameBoxes = (editor: EditorState) => {
  const preview = editor.currentDocument?.paperclip?.html;

  return preview ? getPreviewFrameBoxes(preview).filter(Boolean) : [];
};

const getPreviewFrameBoxes = (preview: HTMLDocument) => {
  const currentPreview = preview;
  const frameBoxes = getPreviewChildren(currentPreview).map((frame: Node) => {
    const metadata = getInnerNode(frame).metadata;
    const box = metadata?.bounds || DEFAULT_FRAME_BOX;
    if (metadata?.visible === false) {
      return null;
    }
    return { ...DEFAULT_FRAME_BOX, ...box };
  });

  return frameBoxes;
};

const getInnerNode = (node: Node) => node.element || node.textNode;

export const getCanvas = (editor: EditorState) => editor.canvas;

export const getPreviewChildren = (frame: HTMLDocument) => {
  // return frame.kind === VirtualNodeKind.Fragment ? frame.children : [frame];
  return frame.children;
};

export const flattenFrameBoxes = memoize(
  (frameBoxes: Record<string, Record<string, Box>>) => {
    const all = {};
    for (const id in frameBoxes) {
      Object.assign(all, frameBoxes[id]);
    }
    return all;
  }
);

export const getNodeInfoAtPoint = (
  point: Point,
  transform: Transform,
  boxes: Record<string, Box>,
  expandedFrameIndex?: number
) => {
  return findBoxNodeInfo(
    getScaledPoint(point, transform),
    expandedFrameIndex ? getFrameBoxes(boxes, expandedFrameIndex) : boxes
  );
};

export const findBoxNodeInfo = memoize(
  (point: Point, boxes: Record<string, Box>): BoxNodeInfo | null => {
    let bestIntersetingBox;
    let bestIntersetingNodePath;
    for (const nodePath in boxes) {
      const box = boxes[nodePath];
      if (boxIntersectsPoint(box, point)) {
        if (
          !bestIntersetingBox ||
          nodePath.length > bestIntersetingNodePath.length
        ) {
          bestIntersetingBox = box;
          bestIntersetingNodePath = nodePath;
        }
      }
    }

    if (!bestIntersetingBox) {
      return null;
    }

    return {
      nodePath: bestIntersetingNodePath,
      box: bestIntersetingBox,
    };
  }
);

export const getFrameBoxes = memoize(
  (boxes: Record<string, Box>, frameIndex: number) => {
    const v = pickBy(boxes, (value: Box, key: string) => {
      return key.indexOf(String(frameIndex)) === 0;
    });
    return v;
  }
);

export const getInsertBox = ({
  canvasMouseDownStartPoint: start,
  canvas: { mousePosition },
}: EditorState): Box => {
  if (!start) {
    return null;
  }

  return {
    width: Math.abs(start.x - mousePosition.x),
    height: Math.abs(start.y - mousePosition.y),
    x: Math.min(start.x, mousePosition.x),
    y: Math.min(start.y, mousePosition.y),
  };
};

export const getCurrentFilePath = (state: EditorState) => {
  return state.history?.query.file;
};

export const getCurrentDependency = (state: EditorState) => {
  return state.graph.dependencies[getCurrentFilePath(state)];
};

export const getExpandedVirtIds = (state: EditorState) =>
  state.expandedLayerVirtIds;

export const getGraph = (state: EditorState) => state.graph;

export const getInsertMode = (state: EditorState) => state.insertMode;
export const getAllPublicAtoms = (state: EditorState) => {
  return ast.getGraphAtoms(state.graph);
};
