import { Dispatch, Engine } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";
import { DesignerState, getSelectedExpression } from "../../state";
export const createClipboardEngine = (
  dispatch: Dispatch<DesignerEvent>,
  getState: () => DesignerState
): Engine<DesignerState, DesignerEvent> => {
  const onCopy = (event: ClipboardEvent) => {
    const expr = getSelectedExpression(getState());
    event.clipboardData.setData("text/plain", JSON.stringify(expr));
    event.preventDefault();
  };

  const onPaste = (event: ClipboardEvent) => {
    const expr = event.clipboardData.getData("text/plain");
    try {
      dispatch({
        type: "clipboard/expressionPasted",
        payload: { expr: JSON.parse(expr) },
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
