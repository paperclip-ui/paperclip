import {
  DesignerClientImpl,
  GrpcWebImpl,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { Engine, Dispatch } from "@paperclip-ui/common";
import { DesignerEngineEvent, designerEngineEvents } from "./events";
import { DesignerEngineState } from "./state";
import { env } from "../../../env";
import { EditorEvent, editorEvents } from "../../events";
import { EditorState, getInsertBox } from "../../state";
import { Mutation } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import {
  getNodeById,
  getNodePath,
} from "@paperclip-ui/proto/lib/virt/html-utils";
import {
  Element as VirtElement,
  TextNode as VirtTextNode,
} from "@paperclip-ui/proto/lib/generated/virt/html";
import { getScaledBox } from "../../state/geom";

export type DesignerEngineOptions = {
  protocol?: string;
  host: string;
  transport?: any;
};

export const createDesignerEngine =
  ({ protocol, host, transport }: DesignerEngineOptions) =>
  (
    dispatch: Dispatch<DesignerEngineEvent>
  ): Engine<DesignerEngineState, DesignerEngineEvent> => {
    const client = new DesignerClientImpl(
      new GrpcWebImpl((protocol || "http:") + "//" + host, {
        transport,
      })
    );

    const actions = createActions(client, dispatch);
    const handleEvent = createEventHandler(actions);
    bootstrap(actions);

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
    applyChanges(mutations: Mutation[]) {
      client.ApplyMutations({ mutations }, null);
    },
  };
};

/**
 * Handles all of the globally emitted events in the ap
 */

const createEventHandler = (actions: Actions) => {
  const handleInsert = (state: EditorState) => {
    const bounds = getScaledBox(getInsertBox(state), state.canvas.transform);

    const mutation: Mutation = {
      insertFrame: {
        documentId: state.currentDocument.paperclip.html.sourceId,
        bounds,
        node: {
          element: {
            tagName: "div",
            id: `${Math.random()}`,
            parameters: [],
            body: [],
          },
        },
      },
    };

    actions.applyChanges([mutation]);
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
    const node = getNodeById(
      prevState.selectedVirtNodeIds[0],
      prevState.currentDocument.paperclip.html
    ) as VirtTextNode | VirtElement;
    const mutation: Mutation = {
      deleteExpression: {
        expressionId: node.sourceId,
      },
    };
    actions.applyChanges([mutation]);
  };

  const handleResizerStoppedMoving = (
    event: ReturnType<typeof editorEvents.resizerPathStoppedMoving>,
    state: EditorState,
    prevState: EditorState
  ) => {
    const node = getNodeById(
      prevState.selectedVirtNodeIds[0],
      prevState.currentDocument.paperclip.html
    ) as VirtTextNode | VirtElement;

    const path = getNodePath(node, prevState.currentDocument.paperclip.html);

    if (path.includes(".")) {
      console.warn("Not implemented yet");
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

const bootstrap = ({ openFile }: Actions) => {
  const urlParams = new URLSearchParams(window.location.search);
  setTimeout(openFile, 1000, urlParams.get("file"));
};
