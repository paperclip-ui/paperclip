import { DesignerClient } from "@paperclip-ui/proto/lib/service/designer_grpc_web_pb";
import {
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
import { TextNode, Element } from "@paperclip-ui/proto/lib/ast/pc_pb";

export const createDesignerEngine = (
  dispatch: Dispatch<DesignerEngineEvent>
): Engine<DesignerEngineState, DesignerEngineEvent> => {
  const client = new DesignerClient(env.protocol + "//" + env.host);

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

const createActions = (client: DesignerClient, dispatch: Dispatch<any>) => {
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
    insertNode(filePath: string, parentId: string) {
      const insertNodeRequest = new InsertNodeRequest();
      insertNodeRequest.setPath(filePath);
      client.insertNode(insertNodeRequest, null, () => {});
    },
  };
};

/**
 * Handles all of the globally emitted events in the ap
 */

const createEventHandler = (actions: Actions) => {
  const handleInsert = (state: EditorState) => {
    const box = getInsertBox(state);
    console.log("INS", box);
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
