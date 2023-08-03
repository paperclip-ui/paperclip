import { FileResponse } from "@paperclip-ui/proto/lib/generated/service/designer";
import { clamp, pickBy } from "lodash";
import {
  Node,
  Document as HTMLDocument,
  Document,
} from "@paperclip-ui/proto/lib/generated/virt/html";
// import * as ast from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
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
import { virtHTML } from "@paperclip-ui/proto-ext/lib/virt/html-utils";

import {
  Element as VirtElement,
  TextNode as VirtText,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import {
  HistoryEngineState,
  INITIAL_HISTORY_STATE,
} from "../domains/history/state";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { Component, Element } from "@paperclip-ui/proto/lib/generated/ast/pc";
import produce from "immer";
import { Bounds } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import {
  CanvasMouseUp,
  ResizerPathMoved,
  ResizerPathStoppedMoving,
} from "../events";
export const IS_WINDOWS = false;

export const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
export const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
export const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
export const MIN_ZOOM = 0.01;
export const MAX_ZOOM = 6400 / 100;
export const DOUBLE_CLICK_MS = 250;

export enum InsertMode {
  Element,
  Text,
  Resource,
}

export enum DNDKind {
  Resource = "Resource",
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
  nodeId: string;
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

type FrameBox = { frameIndex: number } & Box;

export type DesignerState = {
  readonly: boolean;
  scopedElementId?: string;
  selectedTargetId: string;
  activeVariantId?: string;
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
  selectedTargetId: null,
  canvas: {
    transform: { x: 0, y: 0, z: 1 },
    scrollPosition: { x: 0, y: 0 },
  },
  rects: {},
  ...INITIAL_HISTORY_STATE,
};

export const getCurrentDocument = (state: DesignerState) =>
  state.currentDocument;

export const maybeCenterCanvas = (editor: DesignerState, force?: boolean) => {
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
  editor: DesignerState,
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

const getAllFrameBounds = (designer: DesignerState) => {
  return mergeBoxes(getCurrentPreviewFrameBoxes(designer));
};
export const getSelectedNodePath = (designer: DesignerState) => {
  const nodeId = getSelectedNodeId(designer);
  if (!nodeId || !designer.currentDocument) {
    return null;
  }
  const node = virtHTML.getNodeById(
    getSelectedNodeId(designer),
    designer.currentDocument.paperclip.html
  );
  return virtHTML.getNodePath(node, designer.currentDocument.paperclip.html);
};
export const getSelectedNodeId = (designer: DesignerState) => {
  return designer.selectedTargetId;
};
export const getHighlightedNodeId = (designer: DesignerState) =>
  designer.highlightedNodeId;
export const getResizerMoving = (designer: DesignerState) =>
  designer.resizerMoving;
export const getEditorState = (designer: DesignerState) => designer;

export const getCurrentPreviewFrameBoxes = (editor: DesignerState) => {
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

export const getCanvas = (editor: DesignerState) => editor.canvas;

export const getPreviewChildren = (frame: HTMLDocument) => {
  // return frame.kind === VirtualNodeKind.Fragment ? frame.children : [frame];
  return frame.children;
};

export const getInsertBoxes = memoize(
  (
    graph: Graph,
    currentPath: string,
    currentDocument: Document,
    rects: Record<string, Box>
  ) => {
    const dep = graph.dependencies[currentPath];

    if (!dep || !currentDocument) {
      return {};
    }

    const slotBoxes: Record<string, Box> = {};

    const instances = Object.values(ast.flattenDocument(dep.document))
      .filter(
        (node) =>
          node.kind === ast.ExprKind.Element && ast.isInstance(node.expr, graph)
      )
      .map((node) => node.expr) as Element[];

    for (const instance of instances) {
      const component = ast.getInstanceComponent(instance, graph);
      const slots = ast.getComponentSlots(component, graph);
      const virtId = instance.id;

      for (const slot of slots) {
        const containsInsert = instance.body.some(
          (child) => child.insert?.name === slot.name
        );

        // skip since we want the children of this insert to be insertable
        if (containsInsert) {
          continue;
        }

        const slotDescendents = Object.values(ast.flattenSlot(slot));

        const boxes: Box[] = [];
        for (const descendent of slotDescendents) {
          const rect = rects[virtId + "." + descendent.expr.id];
          if (rect) {
            boxes.push(rect);
          }
        }
        slotBoxes[virtId + "." + slot.id] = mergeBoxes(boxes);
      }
    }

    return slotBoxes;
  }
);

const merge = memoize((a, b) => ({ ...a, ...b }));

export const getNodeInfoAtCurrentPoint = (state: DesignerState) => {
  if (!state.canvas.mousePosition) {
    return null;
  }
  const scaledPoint = getScaledPoint(
    state.canvas.mousePosition,
    state.canvas.transform
  );
  const filePath = getCurrentFilePath(state);

  const dep = state.graph.dependencies[filePath];

  if (!dep) {
    return null;
  }

  return findVirtBoxNodeInfo(
    scaledPoint,
    { expr: dep.document, kind: ast.ExprKind.Document },
    filePath,
    state.graph,
    state.scopedElementId,
    [],
    getVirtWithExprRects(state)
  );
};

export const findInsertAtPoint = (
  point: Point,
  state: DesignerState
): BoxNodeInfo | null => {
  const insertBoxes = getInsertBoxes(
    state.graph,
    getCurrentFilePath(state),
    state.currentDocument!.paperclip.html,
    state.rects
  );

  for (const insertId in insertBoxes) {
    if (boxIntersectsPoint(insertBoxes[insertId], point)) {
      return {
        nodeId: insertId,
        box: insertBoxes[insertId],
      };
    }
  }
  return null;
};

const getVirtId = (
  current: ast.InnerExpressionInfo,
  instancePath: string[],
  graph: Graph
) => {
  let parts: string[] = [current.expr.id];
  let curr = current;
  while (
    curr.kind === ast.ExprKind.Element &&
    ast.isInstance(curr.expr, graph)
  ) {
    const component = ast.getInstanceComponent(curr.expr, graph);
    curr = ast.getComponentRenderNode(component);

    if (ast.isInstance(curr.expr, graph)) {
      parts.push(curr.expr.id);
    }
  }

  return [...instancePath, ...parts].join(".");
};

const findVirtBoxNodeInfo = (
  point: Point,
  current: ast.InnerExpressionInfo,
  path: string,
  graph: Graph,
  scopeId: string,
  instancePath: string[],
  boxes: Record<string, Box>
): BoxNodeInfo | null => {
  const virtId = getVirtId(current, instancePath, graph);

  if (
    current.kind === ast.ExprKind.Element &&
    ast.isInstance(current.expr, graph)
  ) {
    // return boxes
    if (!instancePath.length) {
      const info = findInsertBoxesAtPoint(point, current.expr, graph, boxes);
      if (info) {
        return info;
      }
    }

    if (scopeId?.includes(virtId)) {
      const component = ast.getInstanceComponent(current.expr, graph);
      const render = ast.getComponentRenderNode(component);
      const boxInfo = findVirtBoxNodeInfo(
        point,
        render,
        path,
        graph,
        scopeId,
        [...instancePath, virtId],
        boxes
      );
      if (boxInfo) {
        return boxInfo;
      }
    }
  }

  const box = boxes[virtId];

  // const box = boxes[current.id];
  for (const child of ast.getChildren(current)) {
    const childInfo = findVirtBoxNodeInfo(
      point,
      child,
      path,
      graph,
      scopeId,
      instancePath,
      boxes
    );
    if (childInfo) {
      return childInfo;
    }
  }

  return (
    box &&
    boxIntersectsPoint(box, point) && {
      nodeId: virtId,
      box,
    }
  );
};

const findInsertBoxesAtPoint = (
  point: Point,
  instance: Element,
  graph: Graph,
  rects: Record<string, Box>
): BoxNodeInfo => {
  const component = ast.getInstanceComponent(instance, graph);
  const slots = ast.getComponentSlots(component, graph);
  for (const slot of slots) {
    const insertId = instance.id + "." + slot.id;
    const rect = rects[insertId];
    if (rect && boxIntersectsPoint(rect, point)) {
      return {
        nodeId: insertId,
        box: rect,
      };
    }
  }

  // const slotBoxes = getSlotBoxes(instance, graph, rects);
  // for (const id in slotBoxes) {
  //   const box = slotBoxes[id];

  // }

  return null;
};

// const getSlotBoxes = memoize((instance: Element, graph: Graph, rects: Record<string, Box>) => {
//   const component = ast.getInstanceComponent(instance, graph);
//   const slots = ast.getComponentSlots(component, graph);

//   const slotBoxes: Record<string, Box> = {};

//   for (const slot of slots) {
//     const slotDescendents = Object.values(ast.flattenSlot(slot));

//       const instanceSource = ast.getExprById(instance.id, graph) as Element;

//       const containsInsert = instanceSource.body.some(child => child.insert?.name === slot.name);

//       // skip since we want the children of this insert to be insertable
//       if (containsInsert) {
//         continue;
//       }

//       const boxes: Box[] = [];
//       for (const descendent of slotDescendents) {
//         const rect = rects[instance.id + "." + descendent.expr.id];
//         if (rect) {
//           boxes.push(rect);
//         }
//       }
//       slotBoxes[slot.id] = mergeBoxes(boxes);
//     }
//   return slotBoxes
// })

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
}: DesignerState): Box => {
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

export const getCurrentFilePath = (state: DesignerState) => {
  return state.history?.query.file;
};

export const getCurrentDependency = (state: DesignerState) => {
  return state.graph.dependencies[getCurrentFilePath(state)];
};

export const getExpandedVirtIds = (state: DesignerState) =>
  state.expandedLayerVirtIds;

export const getGraph = (state: DesignerState) => state.graph;

export const getInsertMode = (state: DesignerState) => state.insertMode;
export const getAllPublicAtoms = (state: DesignerState) => {
  return ast.getGraphAtoms(state.graph);
};

export const isResourceModalVisible = (state: DesignerState) =>
  state.insertMode === InsertMode.Resource && !state.resourceModalDragLeft;

export type ComponentInfo = {
  sourcePath: string;
  component: Component;
};

export const getAllComponents = (state: DesignerState) => {
  return getGraphComponents(state.graph);
};

export const getCurrentDocumentImports = (state: DesignerState) => ast.getDocumentImports(state.graph.dependencies[getCurrentFilePath(state)].document);


export const getGraphComponents = (graph: Graph) => {
  const allComponents: ComponentInfo[] = [];
  for (const path in graph.dependencies) {
    allComponents.push(
      ...ast
        .getDocumentComponents(graph.dependencies[path].document)
        .map((component) => ({
          sourcePath: path,
          component,
        }))
    );
  }
  return allComponents;
};

export const getScreenshotUrls = (state: DesignerState) => state.screenshotUrls;

export const highlightNode = (
  designer: DesignerState,
  mousePosition: Point
) => {
  return produce(designer, (newDesigner) => {
    newDesigner.canvas.mousePosition = mousePosition;
    const info = getNodeInfoAtCurrentPoint(designer);

    newDesigner.highlightedNodeId = info?.nodeId;
  });
};

const getVirtWithExprRects = (designer: DesignerState) =>
  merge(
    designer.rects,
    getInsertBoxes(
      designer.graph,
      getCurrentFilePath(designer),
      designer.currentDocument?.paperclip.html,
      designer.rects
    )
  );

export const getResourceFilePaths = (state: DesignerState) =>
  state.resourceFilePaths;

export const resetCurrentDocument = (state: DesignerState): DesignerState => ({
  ...state,
  currentDocument: null,
  rects: {},
  computedStyles: {},
  centeredInitial: false,
  selectedTargetId: null,
  highlightedNodeId: null,
  preEditComputedStyles: {},
  canvas: {
    transform: { x: 0, y: 0, z: 1 },
    scrollPosition: { x: 0, y: 0 },
  },
});

export const getExprBounds = (exprId: string, state: DesignerState): Bounds => {

  const node = virtHTML.getNodeById(
    state.selectedTargetId,
    state.currentDocument.paperclip.html
  ) as any as VirtElement | VirtText;

  return node?.metadata?.bounds;
};

export const getHighlightedNodeBox = (state: DesignerState): Box => {
  return getNodeBox(state.highlightedNodeId, state);
};

export const getSelectedNodeBox = (state: DesignerState): Box =>
  getNodeBox(state.selectedTargetId, state);

export const getNodeBox = (virtId: string, state: DesignerState): Box => {
  return getVirtWithExprRects(state)[virtId];
};

export const pruneDanglingRects = (state: DesignerState) => {
  return produce(state, (newState) => {
    for (const nodeId in newState.rects) {
      const frameIndex = newState.rects[nodeId].frameIndex;
      if (frameIndex >= state.currentDocument.paperclip.html.children.length) {
        delete newState.rects[nodeId];
      }
    }
  });
};

export const selectNode = (
  virtNodeId: string | null,
  shiftKey: boolean,
  metaKey: boolean,
  designer: DesignerState
) => {
  designer = produce(designer, (newDesigner) => {
    if (!virtNodeId) {
      newDesigner.selectedTargetId = null;
      return;
    }
    const ancestorIds = ast.getAncestorVirtIdsFromShadow(
      virtNodeId,
      designer.graph
    );

    newDesigner.expandedLayerVirtIds.push(virtNodeId, ...ancestorIds);

    const expr = ast.getExprById(virtNodeId.split(".").pop(), designer.graph);

    newDesigner.selectedTargetId = virtNodeId;
  });

  return designer;
};

export const handleDoubleClick = (
  designer: DesignerState,
  action: CanvasMouseUp
): [DesignerState, boolean] => {
  const oldTimestamp = designer.canvasClickTimestamp;

  if (
    !oldTimestamp ||
    action.payload.timestamp - oldTimestamp > DOUBLE_CLICK_MS
  ) {
    return [
      produce(designer, (newDesigner) => {
        newDesigner.canvasClickTimestamp = action.payload.timestamp;
      }),
      false,
    ];
  }

  const nodeId = getNodeInfoAtCurrentPoint(designer)?.nodeId;

  designer = produce(designer, (newDesigner) => {
    newDesigner.canvasClickTimestamp = action.payload.timestamp;
    newDesigner.scopedElementId = nodeId;
  });

  designer = highlightNode(designer, designer.canvas.mousePosition!);

  return [designer, true];
};

export const handleDragEvent = (
  state: DesignerState,
  event: ResizerPathStoppedMoving | ResizerPathMoved
) => {
  return produce(state, (newState) => {
    const node = virtHTML.getNodeById(
      newState.selectedTargetId,
      newState.currentDocument.paperclip.html
    ) as any as VirtElement | VirtText;

    const path = virtHTML.getNodePath(
      node,
      newState.currentDocument.paperclip.html
    );

    // within a frame
    if (path.includes(".")) {
      const computedStyles = newState.preEditComputedStyles[node.id];

      newState.styleOverrides = {};

      newState.styleOverrides[node.id] = {
        left: `${
          pxToInt(computedStyles.left) +
          event.payload.newBounds.x -
          event.payload.originalBounds.x
        }px`,
        top: `${
          pxToInt(computedStyles.top) +
          event.payload.newBounds.y -
          event.payload.originalBounds.y
        }px`,

        // TODO - check position here to make sure we're not overriding something like "absolute"
        position: "relative",
        width: event.payload.newBounds.width,
        height: event.payload.newBounds.height,
      };

      // is a frame
    } else {
      if (!node.metadata) {
        node.metadata = {};
      }
      if (!node.metadata.bounds) {
        node.metadata.bounds = { x: 0, y: 0, width: 0, height: 0 };
      }

      node.metadata.bounds = {
        ...event.payload.newBounds,
      };
    }
  });
};

export const setSelectedNodeBounds = (newBounds: Bounds, state: DesignerState) => {
  return produce(state, (newState) => {
    const node = virtHTML.getNodeById(
      newState.selectedTargetId,
      newState.currentDocument.paperclip.html
    ) as any as VirtElement | VirtText;

    const path = virtHTML.getNodePath(
      node,
      newState.currentDocument.paperclip.html
    );
    if (!node.metadata) {
      node.metadata = {};
    }
    if (!node.metadata.bounds) {
      node.metadata.bounds = { x: 0, y: 0, width: 0, height: 0 };
    }

    node.metadata.bounds = {
      ...newBounds,
    };
  });
}

export const clampCanvasTransform = (
  canvas: Canvas,
  rects: Record<string, Box>
) => {
  return produce(canvas, (newCanvas) => {
    const w = (canvas.size.width / MIN_ZOOM) * canvas.transform.z;
    const h = (canvas.size.height / MIN_ZOOM) * canvas.transform.z;

    newCanvas.transform.x = clamp(newCanvas.transform.x, -w, w);

    newCanvas.transform.y = clamp(newCanvas.transform.y, -h, w);
  });
};

const pxToInt = (value: string) => Number(value.replace("px", ""));
