import {
  DesignerClientImpl,
  GrpcWebImpl,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { Engine, Dispatch } from "@paperclip-ui/common";
import { DesignerEngineEvent, designerEngineEvents } from "./events";
import { DesignerEngineState } from "./state";
import { env } from "../../../env";
import { EditorEvent, editorEvents } from "../../events";
import { Box, Point } from "../../state/geom";
import { EditorState, getInsertBox, InsertMode } from "../../state";
import {
  AppendChild,
  Mutation,
} from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";

export const createDesignerEngine = (
  dispatch: Dispatch<DesignerEngineEvent>
): Engine<DesignerEngineState, DesignerEngineEvent> => {
  const client = new DesignerClientImpl(
    new GrpcWebImpl(env.protocol + "//" + env.host, {})
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
    const box = getInsertBox(state);

    const mutation: Mutation = {
      appendChild: {
        parentId: state.currentDocument.paperclip.html.sourceId,
        child: {
          element: {
            tagName: "div",
            id: `${Math.random()}`,
            parameters: [],
            range: null,
            body: [],
          },
          text: null,
          slot: null,
          insert: null,
          style: null,
          override: null,
        },
      },
      deleteChild: null,
      setElementParameter: null,
      insertChild: null,
      deleteStyleDeclaration: null,
      setTextNodeValue: null,
      setStyleDeclaration: null,
    };

    actions.applyChanges([mutation]);
  };

  const handleCanvasMouseUp = (state: EditorState, prevState: EditorState) => {
    if (prevState.insertMode != null) {
      return handleInsert(prevState);
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
    }
  };
};

/**
 * Bootstrap script that initializes things based on initial state
 */

const bootstrap = ({ openFile }: Actions) => {
  setTimeout(openFile, 1000, env.initialFile);
};
