import {
  CanvasMouseUp,
  DesignerEvent,
  ResizerPathMoved,
  ResizerPathStoppedMoving,
} from "../../events";
import jasonpatch from "fast-json-patch";
import {
  Canvas,
  DesignerState,
  flattenFrameBoxes,
  getNodeInfoAtPoint,
  getScopedBoxes,
  highlightNode,
  InsertMode,
  IS_WINDOWS,
  maybeCenterCanvas,
} from "../../state";
import produce from "immer";
import { clamp } from "lodash";
import { Box, centerTransformZoom } from "../../state/geom";
import {
  Element as VirtElement,
  TextNode as VirtText,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { virtHTML } from "@paperclip-ui/proto/lib/virt/html-utils";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 6400 / 100;
const DOUBLE_CLICK_MS = 250;

export const legacyReducer = (
  state: DesignerState,
  event: DesignerEvent
): DesignerState => {
  switch (event.type) {
    case "designer-engine/documentOpened":
      state = produce(state, (newState) => {
        newState.currentDocument = event.payload;

        for (const id of newState.insertedNodeIds) {
          if (virtHTML.getNodeById(id, event.payload.paperclip.html)) {
            newState.selectedTargetId = id;
          }

          const expr = ast.getExprById(id, state.graph);
          if (!expr) {
            continue;
          }
          if (ast.isVariant(expr, state.graph)) {
            newState.activeVariantId = expr.id;
          }
        }
        newState.insertedNodeIds = [];
      });
      state = maybeCenterCanvas(state);
      return state;
    case "editor/canvasResized":
      return produce(state, (newState) => {
        newState.canvas.size = event.payload;
      });
    case "editor/editVariantClicked":
      return produce(state, (newState) => {
        newState.activeVariantId = event.payload.variantId;
      });
    case "editor/editVariantPopupClosed":
      return produce(state, (newState) => {
        newState.activeVariantId = null;
      });
    case "designer-engine/changesApplied": {
      return produce(state, (newState) => {
        newState.insertedNodeIds = event.payload.changes
          .map((change) => {
            return change.expressionInserted?.id;
          })
          .filter(Boolean);
      });
    }
    case "history-engine/historyChanged": {
      return produce(state, (newState) => {
        newState.history = event.payload;
      });
    }
    case "designer-engine/graphLoaded": {
      const next = {
        ...state.graph,
        dependencies: {
          ...state.graph.dependencies,
          ...event.payload.dependencies,
        },
      };

      const diff = jasonpatch.compare(
        state.graph.dependencies,
        next.dependencies
      );
      return produce(state, (newState) => {
        jasonpatch.applyPatch(newState.graph.dependencies, diff);
      });
    }
    case "editor/layerLeafClicked": {
      state = selectNode(event.payload.virtId, false, false, state);
      return state;
    }
    case "editor/insertModeButtonClick": {
      return produce(state, (newState) => {
        newState.insertMode = event.payload.mode;
      });
    }
    case "editor/layerArrowClicked": {
      if (state.expandedLayerVirtIds.includes(event.payload.virtId)) {
        const flattened = ast.flattenUnknownInnerExpression(
          ast.getExprById(event.payload.virtId, state.graph)
        );
        state = produce(state, (newState) => {
          newState.expandedLayerVirtIds = newState.expandedLayerVirtIds.filter(
            (id) => flattened[id] == null && !event.payload.virtId.includes(id)
          );
        });
      } else {
        state = produce(state, (newState) => {
          newState.expandedLayerVirtIds.push(event.payload.virtId);
        });
      }

      return state;
    }
    case "editor/canvasMouseUp": {
      state = produce(state, (newState) => {
        if (newState.insertMode != InsertMode.Resource) {
          newState.insertMode = null;
        }
        newState.resourceModalDragLeft = false;
        newState.canvas.mouseDown = false;
        newState.canvasMouseDownStartPoint = undefined;
      });

      if (state.resizerMoving) {
        return state;
      }

      if (!state.canvas.transform || state.canvas.mousePosition?.x == null) {
        return state;
      }

      let doubleClicked;

      [state, doubleClicked] = handleDoubleClick(state, event);

      if (doubleClicked) {
        if (state.selectedTargetId) {
          const node = virtHTML.getNodeById(
            state.selectedTargetId,
            state.currentDocument.paperclip.html
          );

          if (node && virtHTML.isTextNode(node)) {
            state = produce(state, (newDesigner) => {
              newDesigner.showTextEditor = true;
            });
          }
        }
        return state;
      }

      // Don't do this until deselecting can be handled properly
      const nodePath = getNodeInfoAtPoint(
        state.canvas.mousePosition,
        state.canvas.transform,
        getScopedBoxes(
          flattenFrameBoxes(state.rects),
          state.scopedElementPath,
          state.currentDocument.paperclip
        ),
        state.canvas.isExpanded ? state.canvas.activeFrame : null
      )?.nodePath;

      const node = virtHTML.getNodeByPath(
        nodePath,
        state.currentDocument.paperclip.html
      );

      return selectNode(
        node?.id,
        event.payload.shiftKey,
        event.payload.metaKey,
        state
      );
    }
    case "designer/ToolsLayerDrop": {
      return produce(state, (newState) => {
        if (newState.insertMode != InsertMode.Resource) {
          newState.insertMode = null;
        }
        newState.resourceModalDragLeft = false;
        newState.canvas.mouseDown = false;
        newState.canvasMouseDownStartPoint = undefined;
      });
    }
    case "editor/canvasMouseDown": {
      state = produce(state, (newState) => {
        newState.canvas.mouseDown = true;
        newState.canvas.mousePosition = event.payload.position;
        newState.canvasMouseDownStartPoint = event.payload.position;
        newState.preEditComputedStyles = newState.computedStyles;
      });

      return state;
    }
    case "editor/canvasPanned": {
      // do not allow panning when expanded
      if (state.canvas.isExpanded) {
        return state;
      }

      const {
        delta: { x: deltaX, y: deltaY },
        metaKey,
        ctrlKey,
        mousePosition,
        size,
      } = event.payload;

      const delta2X = deltaX * PAN_X_SENSITIVITY;
      const delta2Y = deltaY * PAN_Y_SENSITIVITY;

      return produce(state, (newState) => {
        const transform = newState.canvas.transform;

        if (metaKey || ctrlKey) {
          newState.canvas.transform = centerTransformZoom(
            newState.canvas.transform,
            {
              x: 0,
              y: 0,
              width: size.width,
              height: size.height,
            },
            clamp(
              transform.z + (transform.z * -deltaY) / ZOOM_SENSITIVITY,
              MIN_ZOOM,
              MAX_ZOOM
            ),
            mousePosition
          );
        } else {
          newState.canvas.transform.x = transform.x - delta2X;
          newState.canvas.transform.y = transform.y - delta2Y;
        }

        Object.assign(
          newState.canvas,
          clampCanvasTransform(
            newState.canvas,
            flattenFrameBoxes(newState.rects)
          )
        );
      });
    }
    case "editor/resizerPathStoppedMoving": {
      return handleDragEvent({ ...state, resizerMoving: false }, event);
    }
    case "editor/resizerPathMoved": {
      return handleDragEvent({ ...state, resizerMoving: true }, event);
    }
    case "editor/canvasMouseMoved": {
      return highlightNode(state, event.payload);
    }
    case "editor/computedStylesCaptured":
      return produce(state, (newState) => {
        Object.assign(newState.computedStyles, event.payload.computedStyles);
      });
    case "editor/rectsCaptured":
      state = produce(state, (newState) => {
        newState.rects[event.payload.frameIndex] = event.payload.rects;

        // prune frames that don't exist

        for (const frameIndex in newState.rects) {
          if (
            Number(frameIndex) >=
            state.currentDocument.paperclip.html.children.length
          ) {
            delete newState.rects[frameIndex];
          }
        }
      });
      state = maybeCenterCanvas(state);
      return state;
  }
  return state;
};

const handleDragEvent = (
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

const clampCanvasTransform = (canvas: Canvas, rects: Record<string, Box>) => {
  return produce(canvas, (newCanvas) => {
    const w = (canvas.size.width / MIN_ZOOM) * canvas.transform.z;
    const h = (canvas.size.height / MIN_ZOOM) * canvas.transform.z;

    newCanvas.transform.x = clamp(newCanvas.transform.x, -w, w);

    newCanvas.transform.y = clamp(newCanvas.transform.y, -h, w);
  });
};

const pxToInt = (value: string) => Number(value.replace("px", ""));

const handleDoubleClick = (
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

  const nodePath = getNodeInfoAtPoint(
    designer.canvas.mousePosition,
    designer.canvas.transform,
    getScopedBoxes(
      flattenFrameBoxes(designer.rects),
      designer.scopedElementPath,
      designer.currentDocument.paperclip
    ),
    designer.canvas.isExpanded ? designer.canvas.activeFrame : null
  )?.nodePath;

  designer = produce(designer, (newDesigner) => {
    newDesigner.canvasClickTimestamp = action.payload.timestamp;
    newDesigner.scopedElementPath = nodePath;
  });

  designer = highlightNode(designer, designer.canvas.mousePosition!);

  return [designer, true];
};

const selectNode = (
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

    // if (
    //   newDesigner.scopedElementPath &&
    //   !node.id.startsWith(newDesigner.scopedElementPath)
    // ) {
    //   const preview = newDesigner.currentDocument.paperclip.html;
    //   const node = getNodeByPath(nodePath, preview) as InnerVirtNode;
    //   const instanceAncestor = getInstanceAncestor(node, preview);
    //   newDesigner.scopedElementPath =
    //     instanceAncestor && getNodePath(instanceAncestor, preview);
    // }
  });

  // designer = expandNode(node, designer);
  // if (nodePath) {
  // }

  return designer;
};

// const expandNode = (nodePath: string, designer: EditorState) => {
//   const nodePathAry = nodePathToAry(nodePath);
//   return produce(designer, (newDesigner) => {
//     // can't be empty, so start at 1
//     for (let i = 1, { length } = nodePathAry; i <= length; i++) {
//       const ancestorPath = nodePathAry.slice(0, i).join(".");
//       if (!newDesigner.expandedNodePaths.includes(ancestorPath)) {
//         newDesigner.expandedNodePaths.push(ancestorPath);
//       }
//     }
//   });
// };
