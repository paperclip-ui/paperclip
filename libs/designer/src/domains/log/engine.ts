import { Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";

export const createLogEngine = (
  dispatch,
  getState: () => DesignerState
): Engine<DesignerState, DesignerEvent> => {
  const handleEvent = (event) => {
    console.debug(event, getState());
  };
  return {
    dispose: () => {},
    handleEvent,
  };
};
