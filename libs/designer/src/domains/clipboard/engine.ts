import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import {
  DesignerState,
  getSelectedExpression,
  getTargetExprId,
} from "../../state";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { isEventTargetTextInput } from "../../state/utils";

export const createClipboardEngine = (
  dispatch: Dispatch<DesignerEvent>,
  getState: () => DesignerState
): Engine<DesignerState, DesignerEvent> => {
  const onCutCopy = (event: ClipboardEvent) => {
    const state = getState();

    if (isEventTargetTextInput(event.target)) {
      return;
    }

    if (!getTargetExprId(state)) {
      return;
    }

    const expr = ast.getExprInfoById(getTargetExprId(state), state.graph);
    event.clipboardData.setData(
      "text/plain",
      JSON.stringify({ expr, type: event.type })
    );
    event.preventDefault();
  };

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

  window.document.addEventListener("cut", onCutCopy);
  window.document.addEventListener("copy", onCutCopy);
  window.document.addEventListener("paste", onPaste);

  const handleEvent = (event: DesignerEvent, state: DesignerState) => {};

  return {
    handleEvent,
    dispose: () => {},
  };
};
