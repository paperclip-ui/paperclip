import { designerEngineEvents } from "../../engine/designer/events";
import { EditorEvent, editorEvents } from "../../events";
import {
  Canvas,
  EditorState,
  flattenFrameBoxes,
  getNodeInfoAtPoint,
  InsertMode,
  IS_WINDOWS,
  maybeCenterCanvas,
} from "../../state";
import produce from "immer";
import { clamp, pick } from "lodash";
import { Box, centerTransformZoom, Point } from "../../state/geom";
import { PCModule } from "@paperclip-ui/proto/lib/generated/virt/module";
import {
  Element as VirtElement,
  TextNode as VirtText,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { memoize } from "@paperclip-ui/common";
import {
  InnerVirtNode,
  getNodeAncestors,
  getInstanceAncestor,
  getNodeByPath,
  getNodePath,
  isInstance,
  isNodeParent,
  getInnerNode,
  isTextNode,
  nodePathToAry,
  getNodeById,
} from "@paperclip-ui/proto/lib/virt/html-utils";

const ZOOM_SENSITIVITY = IS_WINDOWS ? 2500 : 250;
const PAN_X_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const PAN_Y_SENSITIVITY = IS_WINDOWS ? 0.05 : 1;
const MIN_ZOOM = 0.01;
const MAX_ZOOM = 6400 / 100;
const DOUBLE_CLICK_MS = 250;

export const editorReducer = (
  state: EditorState,
  event: EditorEvent
): EditorState => {
  switch (event.type) {
    case designerEngineEvents.documentOpened.type:
      state = produce(state, (newState) => {
        newState.currentDocument = event.payload;

        // prune virt nodes that exist
        newState.selectedVirtNodeIds = newState.selectedVirtNodeIds.filter(
          (nodeId) => getNodeById(nodeId, event.payload.paperclip.html)
        );
      });
      state = maybeCenterCanvas(state);
      return state;
    case editorEvents.canvasResized.type:
      return produce(state, (newState) => {
        newState.canvas.size = event.payload;
      });
    case designerEngineEvents.changesApplied.type: {
      return produce(state, (newState) => {
        newState.selectedVirtNodeIds = event.payload.changes
          .map((change) => {
            return (
              change.expressionInserted?.id || change.expressionUpdated?.id
            );
          })
          .filter(Boolean);
      });
    }
    case editorEvents.eHotkeyPressed.type:
      return produce(state, (newState) => {
        newState.insertMode = InsertMode.Element;
      });
    case editorEvents.deleteHokeyPressed.type:
      return produce(state, (newState) => {
        newState.selectedVirtNodeIds = [];
      });
    case editorEvents.canvasMouseUp.type: {
      return produce(state, (newState) => {
        newState.insertMode = null;
        newState.canvas.mouseDown = false;
        newState.canvasMouseDownStartPoint = undefined;
      });
    }
    case editorEvents.canvasMouseDown.type: {
      state = produce(state, (newState) => {
        newState.canvas.mouseDown = true;
        newState.canvas.mousePosition = event.payload.position;
        newState.canvasMouseDownStartPoint = event.payload.position;
      });

      if (state.resizerMoving) {
        return state;
      }

      if (!state.canvas.transform.x || !state.canvas.mousePosition?.x) {
        return state;
      }

      let doubleClicked;

      [state, doubleClicked] = handleDoubleClick(state, event);

      if (doubleClicked) {
        if (state.selectedVirtNodeIds.length) {
          const node = getNodeById(
            state.selectedVirtNodeIds[0],
            state.currentDocument.paperclip.html
          );

          if (node && isTextNode(node)) {
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

      const node = getNodeByPath(
        nodePath,
        state.currentDocument.paperclip.html
      );

      return selectNode(
        node,
        event.payload.shiftKey,
        event.payload.metaKey,
        state
      );
    }
    case editorEvents.canvasPanned.type: {
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
    case editorEvents.resizerPathStoppedMoving.type:
    case editorEvents.resizerPathMoved.type: {
      state = produce(state, (newState) => {
        const node = getNodeById(
          newState.selectedVirtNodeIds[0],
          newState.currentDocument.paperclip.html
        ) as any as VirtElement | VirtText;

        const path = getNodePath(node, newState.currentDocument.paperclip.html);

        // within a frame
        if (path.includes(".")) {
          newState.styleOverrides = {};

          newState.styleOverrides[node.id] = {
            // TODO: need to take delta of computed CSS instead
            left: event.payload.newBounds.x - event.payload.originalBounds.x,
            top: event.payload.newBounds.y - event.payload.originalBounds.y,

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
      return state;
    }
    case editorEvents.canvasMouseMoved.type: {
      return highlightNode(state, event.payload);
    }
    case editorEvents.tmpBreadcrumbClicked.type: {
      return produce(state, (newState) => {
        newState.selectedVirtNodeIds = [event.payload.id];
      });
    }
    case editorEvents.rectsCaptured.type:
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

const clampCanvasTransform = (canvas: Canvas, rects: Record<string, Box>) => {
  return produce(canvas, (newCanvas) => {
    const w = (canvas.size.width / MIN_ZOOM) * canvas.transform.z;
    const h = (canvas.size.height / MIN_ZOOM) * canvas.transform.z;

    newCanvas.transform.x = clamp(newCanvas.transform.x, -w, w);

    newCanvas.transform.y = clamp(newCanvas.transform.y, -h, w);
  });
};

const highlightNode = (designer: EditorState, mousePosition: Point) => {
  return produce(designer, (newDesigner) => {
    newDesigner.canvas.mousePosition = mousePosition;
    const canvas = newDesigner.canvas;
    const info = getNodeInfoAtPoint(
      mousePosition,
      canvas.transform,
      getScopedBoxes(
        flattenFrameBoxes(designer.rects),
        designer.scopedElementPath,
        designer.currentDocument!.paperclip
      ),
      newDesigner.canvas.isExpanded ? newDesigner.canvas.activeFrame : null
    );
    newDesigner.highlightNodePath = info?.nodePath;
  });
};

export const getScopedBoxes = memoize(
  (boxes: Record<string, Box>, scopedElementPath: string, root: PCModule) => {
    const hoverableNodePaths = getHoverableNodePaths(
      scopedElementPath,
      root.html
    );

    return pick(boxes, hoverableNodePaths);
  }
);

const getHoverableNodePaths = memoize(
  (scopedNodePath: string | undefined, root: InnerVirtNode) => {
    const scopedNode = scopedNodePath
      ? getNodeByPath(scopedNodePath, root)
      : root;
    const ancestors = scopedNodePath
      ? getNodeAncestors(scopedNodePath, root)
      : [];

    const hoverable: InnerVirtNode[] = [];

    const scopes = [scopedNode, ...ancestors];

    for (const scope of scopes) {
      addHoverableChildren(scope, true, hoverable);
    }

    return hoverable.map((node) => getNodePath(node, root));
  }
);

const addHoverableChildren = (
  node: InnerVirtNode,
  isScope: boolean,
  hoverable: InnerVirtNode[]
) => {
  if (!hoverable.includes(node)) {
    hoverable.push(node);
  }

  if (isInstance(node) && !isScope) {
    return;
  }

  if (isNodeParent(node)) {
    for (const child of node.children) {
      addHoverableChildren(getInnerNode(child), false, hoverable);
    }
  }
};

const handleDoubleClick = (
  designer: EditorState,
  action: ReturnType<typeof editorEvents.canvasMouseDown>
): [EditorState, boolean] => {
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
  node: VirtElement | VirtText | null,
  shiftKey: boolean,
  metaKey: boolean,
  designer: EditorState
) => {
  designer = produce(designer, (newDesigner) => {
    if (!node) {
      newDesigner.selectedVirtNodeIds = [];
      return;
    }
    // newDesigner.selectedNodeStyleInspections = [];
    // newDesigner.selectedNodeSources = [];

    if (node.id == null) {
      newDesigner.selectedVirtNodeIds = [];
      newDesigner.scopedElementPath = null;
      return;
    }
    if (shiftKey) {
      // allow toggle selecting elements - necessary since escape key doesn't work.
      newDesigner.selectedVirtNodeIds.push(node.id);
    } else {
      newDesigner.selectedVirtNodeIds = [node.id];
    }

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
