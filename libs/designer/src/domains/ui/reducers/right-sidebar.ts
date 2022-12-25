import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { DesignerState, selectNode } from "@paperclip-ui/designer/src/state";
import produce from "immer";

export const rightSidebarReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case "editor/editVariantClicked":
      return produce(state, (newState) => {
        newState.activeVariantId = event.payload.variantId;
      });
    case "editor/editVariantPopupClosed":
      return produce(state, (newState) => {
        newState.activeVariantId = null;
      });

    case "editor/layerLeafClicked": {
      state = selectNode(event.payload.virtId, false, false, state);
      return state;
    }
  }
  return state;
};
