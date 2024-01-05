import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";
import { isEventTargetTextInput } from "../../state/utils";
import { ShortcutCommand } from "../shortcuts/state";

export const createClipboardEngine = (
  dispatch: Dispatch<DesignerEvent>
): Engine<DesignerState, DesignerEvent> => {
  const onPaste = (event: ClipboardEvent) => {
    const expr = event.clipboardData.getData("text/plain");
    try {
      dispatch({
        type: "clipboard/expressionPasted",
        payload: JSON.parse(expr),
      });
    } catch (e) {
      console.log(e);
    }
  };

  window.document.addEventListener("cut", (event) => {
    if (isEventTargetTextInput(event.target)) {
      return;
    }
    dispatch({
      type: "shortcuts/itemSelected",
      payload: { command: ShortcutCommand.Cut },
    });
    event.preventDefault();
  });
  window.document.addEventListener("copy", (event) => {
    if (isEventTargetTextInput(event.target)) {
      return;
    }
    dispatch({
      type: "shortcuts/itemSelected",
      payload: { command: ShortcutCommand.Copy },
    });
    event.preventDefault();
  });
  window.document.addEventListener("paste", onPaste);

  const handleEvent = (event: DesignerEvent, state: DesignerState) => {
    // if (event.type == "shortcuts/itemSelected") {
    //   const expr = ast.getExprInfoById(getTargetExprId(state), state.graph);
    //   if (event.payload.command === ShortcutCommand.CopyStyles) {
    //     navigator.clipboard.writeText(
    //       JSON.stringify({ expr, type: "copyStyles" })
    //     );
    //   } else if (event.payload.command === ShortcutCommand.Copy) {
    //     navigator.clipboard.writeText(JSON.stringify({ expr, type: "copy" }));
    //   } else if (event.payload.command === ShortcutCommand.Cut) {
    //     navigator.clipboard.writeText(JSON.stringify({ expr, type: "cut" }));
    //   } else if (event.payload.command === ShortcutCommand.Paste) {
    //     navigator.clipboard.writeText(JSON.stringify({ expr, type: "cut" }));
    //   }
    // }
  };

  return {
    handleEvent,
    dispose: () => {},
  };
};
