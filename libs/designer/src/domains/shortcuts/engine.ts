import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";

export const createShortcutEngine = (
  dispatch: Dispatch<DesignerEvent>
): Engine<DesignerState, DesignerEvent> => {
  const handleEvent = () => {};
  const dispose = () => {};

  const onKeyDown = (event: KeyboardEvent) => {
    console.log("KD", event);
  };

  window.document.addEventListener("keydown", onKeyDown);
  return {
    handleEvent,
    dispose,
  };
};
