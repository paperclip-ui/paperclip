import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState, getTargetExprId } from "../../state";
import { createKeyDownEvent } from "../keyboard/events";
import {
  ALLOW_DEFAULTS,
  ShortcutCommand,
  getGlobalShortcuts,
  getKeyboardMenuCommand,
} from "./state";
import { History } from "../history/history";
import { routes } from "../../state/routes";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { isEventTargetTextInput } from "../../state/utils";

export const createShortcutsEngine =
  (history: History) =>
  (
    _dispatch: Dispatch<DesignerEvent>,
    getState: () => DesignerState
  ): Engine<DesignerState, DesignerEvent> => {
    const onKeyDown = (event: KeyboardEvent) => {
      if (isEventTargetTextInput(event.target)) {
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

    const handleCommand = (
      command: ShortcutCommand,
      state: DesignerState
    ) => {};

    const handleEvent = (event: DesignerEvent, state: DesignerState) => {
      if (event.type === "shortcuts/itemSelected") {
        return handleCommand(event.payload.command, state);
      } else if (event.type === "keyboard/keyDown") {
        return handleCommand(
          getKeyboardMenuCommand(event, getGlobalShortcuts(state)),
          state
        );
      }
    };

    return {
      handleEvent,
      dispose: () => {},
    };
  };
