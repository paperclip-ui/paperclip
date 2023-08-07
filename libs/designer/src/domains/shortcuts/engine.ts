import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";
import { createKeyDownEvent } from "../keyboard/events";
import {
  ALLOW_DEFAULTS,
  ShortcutCommand,
  getGlobalShortcuts,
  getKeyboardMenuCommand,
} from "./state";

export const createShortcutsEngine = (
  _dispatch: Dispatch<DesignerEvent>,
  getState: () => DesignerState
): Engine<DesignerState, DesignerEvent> => {
  const onKeyDown = (event: KeyboardEvent) => {
    if (/textarea|input/i.test((event.target as HTMLElement).tagName)) {
      return;
    }

    const command = getKeyboardMenuCommand(
      createKeyDownEvent(event),
      getGlobalShortcuts(getState())
    );

    if (command && !ALLOW_DEFAULTS.includes(command)) {
      event.preventDefault();
    }
  };

  window.document.addEventListener("keydown", onKeyDown);

  const handleCopy = (event: DesignerEvent, state: DesignerState) => {};

  const handleEvent = (event: DesignerEvent, state: DesignerState) => {
    const command =
      event.type === "keyboard/keyDown" &&
      getKeyboardMenuCommand(event, getGlobalShortcuts(state));
    switch (command) {
      case ShortcutCommand.Copy: {
        return handleCopy(event, state);
      }
    }
  };

  return {
    handleEvent,
    dispose: () => {},
  };
};
