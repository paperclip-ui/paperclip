import {
  DesignerClientImpl,
  GrpcWebImpl,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { Engine, Dispatch } from "@paperclip-ui/common";
import { DesignerEngineEvent, designerEngineEvents } from "./events";
import { DesignerEngineState } from "./state";
import { EditorEvent, editorEvents } from "../../events";
import {
  EditorState,
  flattenFrameBoxes,
  getInsertBox,
  getNodeInfoAtPoint,
  InsertMode,
} from "../../state";
import { Mutation } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { virtHTML } from "@paperclip-ui/proto/lib/virt/html-utils";
import {
  Element as VirtElement,
  TextNode as VirtTextNode,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { getScaledBox, roundBox } from "../../state/geom";

export type DesignerEngineOptions = {
  protocol?: string;
  host: string;
  transport?: any;
};

export const createDesignerEngine =
  ({ protocol, host, transport }: DesignerEngineOptions) =>
  (
    dispatch: Dispatch<DesignerEngineEvent>,
    state: DesignerEngineState
  ): Engine<DesignerEngineState, DesignerEngineEvent> => {
    const client = new DesignerClientImpl(
      new GrpcWebImpl((protocol || "http:") + "//" + host, {
        transport,
      })
    );

    const actions = createActions(client, dispatch);
    const handleEvent = createEventHandler(actions);
    bootstrap(actions, state);

    const dispose = () => {};
    return {
      handleEvent,
      dispose,
    };
  };

type Actions = ReturnType<typeof createActions>;

/**
 * All of the imperative actions that can be invoked in the engine
 */

const createActions = (client: DesignerClientImpl, dispatch: Dispatch<any>) => {
  return {
    openFile(filePath: string) {
      client.OpenFile({ path: filePath }).subscribe({
        next(data) {
          dispatch(designerEngineEvents.documentOpened(data));
        },
        complete() {},
        error() {},
      });
    },
    syncGraph() {
      client.GetGraph({}).subscribe({
        next(data) {
          dispatch(designerEngineEvents.graphLoaded(data));
        },
      });
    },
    async applyChanges(mutations: Mutation[]) {
      const changes = await client.ApplyMutations({ mutations }, null);
      dispatch(designerEngineEvents.changesApplied(changes));
      return changes;
    },
  };
};

/**
 * Handles all of the globally emitted events in the ap
 */

const createEventHandler = (actions: Actions) => {
  const handleInsert = async (state: EditorState) => {
    let bounds = getScaledBox(getInsertBox(state), state.canvas.transform);
    const insertMode = state.insertMode;

    const intersectingNode = getNodeInfoAtPoint(
      state.canvas.mousePosition,
      state.canvas.transform,
      flattenFrameBoxes(state.rects)
    );

    if (!intersectingNode) {
      const mutation: Mutation = {
        insertFrame: {
          documentId: state.currentDocument.paperclip.html.sourceId,
          bounds: roundBox(bounds),
          nodeSource: {
            [InsertMode.Element]: `div {
              style {
                position: relative
              }
            }`,
            [InsertMode.Text]: `text "Type something"`,
          }[insertMode],
        },
      };

      actions.applyChanges([mutation]);
    } else {
      const parent = virtHTML.getNodeByPath(
        intersectingNode.nodePath,
        state.currentDocument.paperclip.html
      );

      const parentBox = flattenFrameBoxes(state.rects)[
        intersectingNode.nodePath
      ];

      bounds = roundBox({
        ...bounds,
        x: bounds.x - parentBox.x,
        y: bounds.y - parentBox.y,
      });

      actions.applyChanges([
        {
          appendChild: {
            parentId: parent.sourceId,
            childSource: {
              [InsertMode.Element]: `div {
                style {
                  background: rgba(0,0,0,0.1)
                  position: absolute
                  left: ${bounds.x}px
                  top: ${bounds.y}px
                  width: ${bounds.width}px
                  height: ${bounds.height}px
                }
              }`,
              [InsertMode.Text]: `text "Type something"`,
            }[insertMode],
          },
        },
      ]);
    }
  };

  const handleCanvasMouseUp = (state: EditorState, prevState: EditorState) => {
    if (prevState.insertMode != null) {
      return handleInsert(prevState);
    }
  };

  const handleDeleteKeyPressed = (
    state: EditorState,
    prevState: EditorState
  ) => {
    for (const id of prevState.selectedVirtNodeIds) {
      const node = virtHTML.getNodeById(
        id,
        prevState.currentDocument.paperclip.html
      ) as VirtTextNode | VirtElement;

      if (!node) {
        console.warn(`Node doesn't exist, skipping delete`);
        continue;
      }

      const mutation: Mutation = {
        deleteExpression: {
          expressionId: node.sourceId,
        },
      };
      actions.applyChanges([mutation]);
    }
  };

  const handleResizerStoppedMoving = (
    event: ReturnType<typeof editorEvents.resizerPathStoppedMoving>,
    state: EditorState,
    prevState: EditorState
  ) => {
    const node = virtHTML.getNodeById(
      prevState.selectedVirtNodeIds[0],
      prevState.currentDocument.paperclip.html
    ) as VirtTextNode | VirtElement;

    const path = virtHTML.getNodePath(
      node,
      prevState.currentDocument.paperclip.html
    );

    if (path.includes(".")) {
      actions.applyChanges([
        {
          setStyleDeclarations: {
            expressionId: node.sourceId,
            declarations: Object.entries(
              state.styleOverrides[prevState.selectedVirtNodeIds[0]]
            ).map(([name, value]) => {
              return { name, value: String(value) };
            }),
          },
        },
      ]);
    } else {
      const newBounds = node.metadata.bounds;

      const mutation: Mutation = {
        setFrameBounds: {
          frameId: node.sourceInstanceIds.length
            ? node.sourceInstanceIds[0]
            : node.sourceId,
          bounds: newBounds,
        },
      };
      actions.applyChanges([mutation]);
    }
  };

  return (
    event: EditorEvent,
    newState: EditorState,
    prevState: EditorState
  ) => {
    switch (event.type) {
      case editorEvents.canvasMouseUp.type: {
        return handleCanvasMouseUp(newState, prevState);
      }
      case editorEvents.eHotkeyPressed.type: {
        return handleCanvasMouseUp(newState, prevState);
      }
      case editorEvents.deleteHokeyPressed.type: {
        return handleDeleteKeyPressed(newState, prevState);
      }
      case editorEvents.resizerPathStoppedMoving.type: {
        return handleResizerStoppedMoving(event, newState, prevState);
      }
    }
  };
};

/**
 * Bootstrap script that initializes things based on initial state
 */

const bootstrap = (
  { openFile, syncGraph }: Actions,
  initialState: DesignerEngineState
) => {
  setTimeout(() => {
    openFile(initialState.history.query.file);
    syncGraph();
  }, 100);
};
