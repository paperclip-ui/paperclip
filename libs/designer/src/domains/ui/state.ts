import produce from "immer";
import {
  Element as VirtElement,
  TextNode as VirtText,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { virtHTML } from "@paperclip-ui/proto-ext/lib/virt/html-utils";
import {
  Canvas,
  DesignerState,
  IS_WINDOWS,
  findVirtNode,
  getAllFrameBounds,
  getNodeInfoAtCurrentPoint,
  getPreviewFrameBoxes,
  highlightNode,
} from "../../state";
import {
  CanvasMouseUp,
  ResizerPathMoved,
  ResizerPathStoppedMoving,
} from "./events";
import { Box, centerTransformZoom } from "../../state/geom";
import { clamp } from "lodash";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";

export const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
export const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
export const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
export const MIN_ZOOM = 0.01;
export const MAX_ZOOM = 6400 / 100;
export const DOUBLE_CLICK_MS = 250;
const INITIAL_ZOOM_PADDING = 50;

export const handleDragEvent = (
  state: DesignerState,
  event: ResizerPathStoppedMoving | ResizerPathMoved
) => {
  return produce(state, (newState) => {
    const node = findVirtNode(newState.selectedTargetId, newState) as any as
      | VirtElement
      | VirtText;

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

        position:
          computedStyles.position === "static"
            ? "relative"
            : computedStyles.position,

        width: event.payload.newBounds.width + "px",
        height: event.payload.newBounds.height + "px",
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

const pxToInt = (value: string) => Number(value.replace("px", ""));

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

    newDesigner.selectedTargetId = virtNodeId;
  });

  return designer;
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
