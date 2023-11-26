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
  getCurrentPreviewFrameBoxes,
  getNodeBox,
  getPreviewFrameBoxes,
  getTargetExprId,
  setTargetExprId,
} from "../../state";
import {
  CanvasMouseUp,
  ResizerPathMoved,
  ResizerPathStoppedMoving,
} from "./events";
import { Box, centerTransformZoom } from "../../state/geom";
import { clamp, uniq } from "lodash";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { WritableDraft } from "immer/dist/internal";
import { jsonToMetadataValue, metadataValueMapToJSON } from "@paperclip-ui/proto/lib/virt/html-utils";

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
    const node = findVirtNode(getTargetExprId(state), newState) as any as
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
      newState.atomOverrides = {};

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
        node.metadata = {value:{}};
      }

      node.metadata.value.bounds = jsonToMetadataValue(event.payload.newBounds);
    }
  });
};

export const prettyKeyCombo = (combo: string[]) => {
  return combo
    .join("+")
    .replace("meta", "⌘")
    .replace("delete", "⌫")
    .replace("backspace", "⌫")
    .replace("option", "⌥")
    .replace("shift", "⇧")
    .replace("control", "^")
    .replace("alt", "⌥")
    .replaceAll("+", "")
    .toUpperCase();
};

export const getSelectedExprIdSourceId = (state: DesignerState) => {
  const { expr } = ast.getExprByVirtId(getTargetExprId(state), state.graph);

  if (ast.isInstance(expr, state.graph)) {
    const component = ast.getInstanceComponent(expr, state.graph);
    const renderNode = ast.getComponentRenderNode(component);
    return component.id;
  } else {
    return expr.id;
  }
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

  // const nodeId = getNodeInfoAtCurrentPoint(designer)?.nodeId;
  const virtId = getSelectedExprIdSourceId(designer);
  const expr = ast.getExprByVirtId(virtId, designer.graph);

  designer = produce(designer, (newDesigner) => {
    newDesigner.canvasClickTimestamp = action.payload.timestamp;

    setTargetExprId(newDesigner, virtId);

    // LEGACY.
    // newDesigner.scopedElementId = nodeId;
  });

  if (
    expr.kind === ast.ExprKind.Element &&
    ast.isInstance(expr.expr, designer.graph)
  ) {
    // force center canvas to component when double clicked
    designer = maybeCenterCanvas(designer, true);
  }

  // LEGACY. We want to redirect to the component instead
  // designer = highlightNode(designer, designer.canvas.mousePosition!);

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

export const expandVirtIds = <
  TState extends DesignerState | WritableDraft<DesignerState>
>(
  ids: string[],
  state: TState
) => {
  return {
    ...state,
    expandedLayerVirtIds: uniq([...ids, ...state.expandedLayerVirtIds]),
  };
};

export const findSelectableExprId = (
  virtNodeId: string,
  state: DesignerState | WritableDraft<DesignerState>
) => {
  if (virtNodeId.includes(".")) {
    return virtNodeId;
  }

  const exprInfo = ast.getExprByVirtId(virtNodeId, state.graph);

  // may not exist because of virt expr ids. E.g: inst.slot:name
  if (!exprInfo) {
    return virtNodeId;
  }

  const { expr } = exprInfo;

  const parent = ast.getParentExprInfo(expr.id, state.graph);
  if (parent.kind === ast.ExprKind.Render) {
    const component = ast.getParentExprInfo(parent.expr.id, state.graph);
    return component.expr.id;
  }

  return virtNodeId;
};

export const selectNode = (
  virtNodeId: string | null,
  shiftKey: boolean,
  metaKey: boolean,
  designer: DesignerState
) => {
  virtNodeId = virtNodeId && findSelectableExprId(virtNodeId, designer);

  designer = produce(designer, (newDesigner) => {
    if (!virtNodeId) {
      setTargetExprId(newDesigner, null);
      return;
    }

    setTargetExprId(newDesigner, virtNodeId);
  });

  return designer;
};

const boundsIsNull = (bounds: Box) =>
  bounds.x + bounds.y + bounds.width + bounds.height === 0;

// https://github.com/crcn/tandem/blob/10.0.0/packages/dashboard/src/state/index.ts#L1304
export const centerEditorCanvas = (
  editor: DesignerState,
  innerBounds: Box,
  zoomOrZoomToFit: boolean | number = true
) => {
  // no windows loaded
  if (boundsIsNull(innerBounds)) {
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

const allFrameRectsLoaded = (state: DesignerState) => {
  const frames = getCurrentPreviewFrameBoxes(state);
  return (
    frames.length ===
    uniq(Object.values(state.rects).map((rect) => rect.frameIndex)).length
  );
};

export const maybeCenterCanvas = (editor: DesignerState, force?: boolean) => {
  if (!allFrameRectsLoaded(editor)) {
    return editor;
  }

  if (
    force ||
    (!editor.centeredInitial &&
      editor.canvas.size?.width &&
      editor.canvas.size?.height)
  ) {
    let targetBounds: Box;
    const currentFrameIndex = editor.canvas.activeFrame;
    const currentExprId = getTargetExprId(editor);
    if (currentExprId != null) {
      targetBounds = getNodeBox(currentExprId, editor);
    } else if (currentFrameIndex != null) {
      const frameBoxes = getPreviewFrameBoxes(
        editor.currentDocument?.paperclip?.html
      );
      targetBounds = frameBoxes[currentFrameIndex];
    }

    if (!targetBounds) {
      targetBounds = getAllFrameBounds(editor);
    }

    // ONLY center if there are actual bounds
    if (!targetBounds || boundsIsNull(targetBounds)) {
      return editor;
    }

    editor = { ...editor, centeredInitial: true };

    editor = centerEditorCanvas(editor, targetBounds);

    return editor;
  }
  return editor;
};
