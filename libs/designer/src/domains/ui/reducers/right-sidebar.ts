import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { DesignerState } from "@paperclip-ui/designer/src/state";
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
  }
  return state;
};
