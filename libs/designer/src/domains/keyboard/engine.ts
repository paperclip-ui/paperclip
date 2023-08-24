import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";
import { createKeyDownEvent } from "./events";

export const createKeyboardEngine = (
  dispatch: Dispatch<DesignerEvent>
): Engine<DesignerState, DesignerEvent> => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (/textarea|input/i.test((event.target as HTMLElement).tagName)) {
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
