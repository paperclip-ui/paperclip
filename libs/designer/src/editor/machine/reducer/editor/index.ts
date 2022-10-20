import { designerEngineEvents } from "../../engine/designer/events";
import { EditorEvent, editorEvents } from "../../events";
import {
  Canvas,
  EditorState,
  flattenFrameBoxes,
  getNodeInfoAtPoint,
  IS_WINDOWS,
  maybeCenterCanvas,
} from "../../state";
import produce from "immer";
import { clamp, pick } from "lodash";
import { Box, centerTransformZoom, Point } from "../../state/geom";
import { PCModule } from "@paperclip-ui/proto/lib/virt/module_pb";
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
} from "@paperclip-ui/proto/lib/virt/html";

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
        newState.currentDocument = event.payload.toObject();
      });
      state = maybeCenterCanvas(state);
      return state;
    case editorEvents.canvasResized.type:
      return produce(state, (newState) => {
        newState.canvas.size = event.payload;
      });
    case editorEvents.canvasMouseDown.type: {
      if (state.resizerMoving) {
        return state;
      }

      if (!state.canvas.transform.x || !state.canvas.mousePosition?.x) {
        return state;
      }

      let doubleClicked;

      [state, doubleClicked] = handleDoubleClick(state, event);

      if (doubleClicked) {
        if (state.selectedNodePaths.length) {
          const node = getNodeByPath(
            state.selectedNodePaths[0],
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

      return selectNode(
        nodePath,
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
          newState.canvas.transform.x = transform.x - delta2X; // clamp(transform.x - delta2X, 0, size.width * transform.z - size.width);
          newState.canvas.transform.y = transform.y - delta2Y; // clamp(transform.y - delta2Y, 0, size.height * transform.z - size.height);
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
    case editorEvents.canvasMouseMoved.type: {
      return highlightNode(state, event.payload);
    }
    case editorEvents.tmpBreadcrumbClicked.type: {
      return produce(state, (newState) => {
        console.log(
          event.payload,
          getNodePath(event.payload, state.currentDocument.paperclip.html)
        );
        newState.selectedNodePaths = [
          getNodePath(event.payload, state.currentDocument.paperclip.html),
        ];
      });
    }
    case editorEvents.rectsCaptured.type:
      state = produce(state, (newState) => {
        newState.rects[event.payload.frameIndex] = event.payload.rects;
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
  (
    boxes: Record<string, Box>,
    scopedElementPath: string,
    root: PCModule.AsObject
  ) => {
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
    for (const child of node.childrenList) {
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
  nodePath: string,
  shiftKey: boolean,
  metaKey: boolean,
  designer: EditorState
) => {
  designer = produce(designer, (newDesigner) => {
    // newDesigner.selectedNodeStyleInspections = [];
    // newDesigner.selectedNodeSources = [];

    if (nodePath == null) {
      newDesigner.selectedNodePaths = [];
      newDesigner.scopedElementPath = null;
      return;
    }
    if (shiftKey) {
      // allow toggle selecting elements - necessary since escape key doesn't work.
      newDesigner.selectedNodePaths.push(nodePath);
    } else {
      newDesigner.selectedNodePaths = [nodePath];
    }

    if (
      newDesigner.scopedElementPath &&
      !nodePath.startsWith(newDesigner.scopedElementPath)
    ) {
      const preview = newDesigner.currentDocument.paperclip.html;
      const node = getNodeByPath(nodePath, preview) as InnerVirtNode;
      const instanceAncestor = getInstanceAncestor(node, preview);
      newDesigner.scopedElementPath =
        instanceAncestor && getNodePath(instanceAncestor, preview);
    }
  });

  if (nodePath) {
    designer = expandNode(nodePath, designer);
  }

  return designer;
};

const expandNode = (nodePath: string, designer: EditorState) => {
  const nodePathAry = nodePathToAry(nodePath);
  return produce(designer, (newDesigner) => {
    // can't be empty, so start at 1
    for (let i = 1, { length } = nodePathAry; i <= length; i++) {
      const ancestorPath = nodePathAry.slice(0, i).join(".");
      if (!newDesigner.expandedNodePaths.includes(ancestorPath)) {
        newDesigner.expandedNodePaths.push(ancestorPath);
      }
    }
  });
};
