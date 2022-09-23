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
  const fileRequest = new FileRequest();
  fileRequest.setPath("something.pc");
  client.openFile(fileRequest);

  const handleEvent = () => {};

  return {
    handleEvent,
    dispose: () => {},
  };
};
