import produce from "immer";
import { DesignerEvent } from "../../../events";
import { DesignerState, highlightNode } from "../../../state";

export const toolsLayerReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case "designer/ToolsLayerDragOver": {
      return highlightNode(state, event.payload);
    }
    case "ui/toolsTextEditorChanged": {
      return produce(state, (newState) => {
        newState.showTextEditor = false;
      });
    }
  }
  return state;
};
