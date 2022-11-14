import { service } from "@paperclip-ui/proto/lib/service/designer";
import pb from "google-protobuf";
import {
  ApplyMutationsRequest,
  FileRequest,
  InsertNodeRequest,
} from "@paperclip-ui/proto/lib/service/designer_pb";
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
} from "@paperclip-ui/proto/lib/ast_mutate/mod_pb";

export const createDesignerEngine = (
  dispatch: Dispatch<DesignerEngineEvent>
): Engine<DesignerEngineState, DesignerEngineEvent> => {
  const client = new service.designer.DesignerClient(
    env.protocol + "//" + env.host,
    null
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

const createActions = (
  client: service.designer.DesignerClient,
  dispatch: Dispatch<any>
) => {
  return {
    openFile(filePath: string) {
      const fileRequest = new FileRequest();
      fileRequest.setPath(filePath);
      client
        .openFile(fileRequest)
        .on("data", (data) => {
          console.log("incoming");
          dispatch(designerEngineEvents.documentOpened(data));
        })
        .on("error", () => {})
        .on("end", () => {
          console.log("END");
        });
    },
    applyChanges(mutations: Mutation[]) {
      const request = new ApplyMutationsRequest();
      request.setMutationsList(mutations);
      client.applyMutations(request, null, () => {});
    },
  };
};

/**
 * Handles all of the globally emitted events in the ap
 */

const createEventHandler = (actions: Actions) => {
  const handleInsert = (state: EditorState) => {
    const box = getInsertBox(state);

    // const mutation = new Mutation();
    // const appendChild = new AppendChild();
    // appendChild.setParentId(state.currentDocument.paperclip.html.sourceId);
    // const newNode = new Node();
    // const element = new Element();
    // element.setId(`${Math.random()}`);
    // newNode.setElement(element);
    // appendChild.setChild(newNode);
    // mutation.setAppendChild(appendChild);
    // actions.applyChanges([
    //   mutation
    // ])
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
