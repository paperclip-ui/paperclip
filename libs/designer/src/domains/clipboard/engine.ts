import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState, getSelectedExpression } from "../../state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";

export const createClipboardEngine = (
  dispatch: Dispatch<DesignerEvent>,
  getState: () => DesignerState
): Engine<DesignerState, DesignerEvent> => {
  const onCopy = (event: ClipboardEvent) => {
    const state = getState();

    if (!state.selectedTargetId) {
      return;
    }

    const expr = ast.getExprInfoById(state.selectedTargetId, state.graph);
    event.clipboardData.setData("text/plain", JSON.stringify(expr));
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

  window.document.addEventListener("copy", onCopy);
  window.document.addEventListener("paste", onPaste);

  const handleEvent = (event: DesignerEvent, state: DesignerState) => {};

  return {
    handleEvent,
    dispose: () => {},
  };
};
