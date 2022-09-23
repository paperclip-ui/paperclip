import { DesignerClient } from "../../proto/designer_grpc_web_pb";
import { Engine } from "../../state-machine/engine";
import { Dispatch } from "../../state-machine/events";

export const createDesignerEngine = (
  dispatch: Dispatch<any>
): Engine<any, any> => {
  const client = new DesignerClient(window.location.hostname);

  const handleEvent = () => {};

  return {
    handleEvent,
    dispose: () => {},
  };
};
