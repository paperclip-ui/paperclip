import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState, getTargetExprId } from "../../state";
import { createKeyDownEvent } from "../keyboard/events";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";

import {
  ALLOW_DEFAULTS,
  ShortcutCommand,
  getGlobalShortcuts,
  getKeyboardMenuCommand,
} from "./state";
import { isEventTargetTextInput } from "../../state/utils";
import { ClipboardPayload } from "../clipboard/events";
import { APIActions } from "../../api";

export const createShortcutsEngine =
  (api: APIActions) =>
  (
    dispatch: Dispatch<DesignerEvent>,
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

    const handleCopy = async (
      command: ShortcutCommand,
      state: DesignerState
    ) => {
      if (!getTargetExprId(state)) {
        return;
      }

      let payload: ClipboardPayload;
      const expr = ast.getExprInfoById(getTargetExprId(state), state.graph);

      if (command === ShortcutCommand.CopyStyles) {
        const info = ast.getDisplayNode(expr.expr.id, state.graph);
        payload = {
          data: ast.computeElementStyle(info.expr.id, state.graph),
          type: command,
        };
      } else if (command === ShortcutCommand.Copy) {
        payload = {
          data: await api.copyExpression(expr.expr.id),
          type: command,
        };
      } else if (command === ShortcutCommand.Cut) {
        payload = { data: expr.expr.id, type: command };
      }

      navigator.clipboard.writeText(JSON.stringify(payload));
    };

    const handleCommand = (command: ShortcutCommand, state: DesignerState) => {
      if (
        command === ShortcutCommand.Copy ||
        command === ShortcutCommand.Cut ||
        command === ShortcutCommand.CopyStyles
      ) {
        handleCopy(command, state);
      } else if (command === ShortcutCommand.Paste) {
        // handlePaste();
      }
    };

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
