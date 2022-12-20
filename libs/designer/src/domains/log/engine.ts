import { Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";

export const createLogEngine = (): Engine<DesignerState, DesignerEvent> => {
  const handleEvent = (event) => {
    console.debug(event);
  };
  return {
    dispose: () => {},
    handleEvent,
  };
};
