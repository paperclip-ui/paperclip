import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  DesignerState,
  setSelectedNodeBounds,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import produce from "immer";

export const rightSidebarReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case "ui/editVariantClicked":
      return produce(state, (newState) => {
        newState.activeVariantId = event.payload.variantId;
        newState.editVariantPopupOpen = true;
      });
    case "designer-engine/documentOpened": {
      return produce(state, (newState) => {
        newState.currentDocument = event.payload;
        for (const id of newState.insertedNodeIds) {
          const expr = ast.getExprInfoById(id, state.graph);
          if (!expr) {
            continue;
          }
          if (expr.kind === ast.ExprKind.Variant) {
            newState.editVariantPopupOpen = true;
          }
        }
      });
    }

    case "ui/AddVariantPopupClicked": {
      return produce(state, (newState) => {
        newState.editVariantPopupOpen = true;
      });
    }
    case "ui/editVariantPopupClosed":
      return produce(state, (newState) => {
        newState.activeVariantId = null;
        newState.editVariantPopupOpen = false;
      });
    case "ui/editVariantClicked": {
      return produce(state, (newState) => {
        newState.editVariantPopupOpen = true;
      });
    }
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
