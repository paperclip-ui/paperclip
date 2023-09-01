import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";
import { createKeyDownEvent } from "./events";
import { isEventTargetTextInput } from "../../state/utils";

export const createKeyboardEngine = (
  dispatch: Dispatch<DesignerEvent>
): Engine<DesignerState, DesignerEvent> => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (isEventTargetTextInput(event.target)) {
      return;
    }

    dispatch(createKeyDownEvent(event));
  };

  window.document.addEventListener("keydown", onKeyDown);

  return {
    handleEvent: () => {},
    dispose: () => {},
  };
};
