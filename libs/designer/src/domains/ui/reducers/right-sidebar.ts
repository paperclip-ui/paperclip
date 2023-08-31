import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  DesignerState,
  setSelectedNodeBounds,
} from "@paperclip-ui/designer/src/state";
import produce from "immer";

export const rightSidebarReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case "ui/editVariantClicked":
      return produce(state, (newState) => {
        newState.activeVariantId = event.payload.variantId;
      });
    case "ui/editVariantPopupClosed":
      return produce(state, (newState) => {
        newState.activeVariantId = null;
      });

    case "ui/variantSelected": {
      return produce(state, (newState) => {
        newState.selectedVariantIds = event.payload;
      });
    }
    case "ui/boundsChanged": {
      state = setSelectedNodeBounds(event.payload.newBounds, state);
      return state;
    }
  }
  return state;
};
