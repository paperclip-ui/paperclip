import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";
import { keyboardEvents } from "./events";

export const createKeyboardEngine = (
  dispatch: Dispatch<DesignerEvent>
): Engine<DesignerState, DesignerEvent> => {
  const onKeyDown = ({
    key,
    shiftKey,
    metaKey,
    ctrlKey,
    altKey,
    target,
  }: KeyboardEvent) => {
    if (/textarea|input/i.test((target as HTMLElement).tagName)) {
      return;
    }
    dispatch(
      keyboardEvents.keyDown({
        key,
        shiftKey,
        metaKey,
        ctrlKey,
        altKey,
      })
    );
  };

  window.document.addEventListener("keydown", onKeyDown);

  return {
    handleEvent: () => {},
    dispose: () => {},
  };
};
