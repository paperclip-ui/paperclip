import { DesignerClient } from "../../../proto/designer_grpc_web_pb";
import { FileRequest } from "../../../proto/designer_pb";
import { Engine } from "../../../modules/machine/engine";
import { Dispatch } from "../../../modules/machine/events";
import { DesignerEngineEvent } from "./events";
import { DesignerEngineState } from "./state";

export const createDesignerEngine = (
  dispatch: Dispatch<DesignerEngineEvent>
): Engine<DesignerEngineState, DesignerEngineEvent> => {
  const client = new DesignerClient(
    window.location.protocol + "//" + window.location.host
  );

  const actions = createActions(client, dispatch);
  const handleEvent = createEventHandler(actions);
  init(actions);
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
          console.log(data);
        })
        .on("end", () => {
          console.log("END");
        });
    },
  };
};

/**
 * Handles all of the globally emitted events in the ap
 */

const createEventHandler = (actions: Actions) => {
  return (
    event: DesignerEngineEvent,
    newState: DesignerEngineState,
    prevState: DesignerEngineState
  ) => {};
};

/**
 * Boostrap
 */

const init = ({ openFile }: Actions) => {
  openFile(new URLSearchParams(window.location.search).get("file"));
};
