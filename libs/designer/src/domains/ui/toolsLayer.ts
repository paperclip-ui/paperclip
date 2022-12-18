import { DesignerEvent, designerEvents } from "../../events";
import { DesignerState, highlightNode } from "../../state";

export const toolsLayerReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case designerEvents.toolsLayerDragOver.type: {
      return highlightNode(state, event.payload);
    }
  }
  return state;
};
