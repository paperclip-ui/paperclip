import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";
import { createKeyDownEvent } from "../keyboard/events";
import { getGlobalShortcuts, getKeyboardMenuCommand } from "./state";

export const createShortcutsEngine = (
  _dispatch: Dispatch<DesignerEvent>,
  initialState: DesignerState
): Engine<DesignerState, DesignerEvent> => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (/textarea|input/i.test((event.target as HTMLElement).tagName)) {
      return;
    }

    if (
      getKeyboardMenuCommand(
        createKeyDownEvent(event),
        getGlobalShortcuts(initialState)
      )
    ) {
      event.preventDefault();
    }
  };

  window.document.addEventListener("keydown", onKeyDown);

  return {
    handleEvent: () => {},
    dispose: () => {},
  };
};
