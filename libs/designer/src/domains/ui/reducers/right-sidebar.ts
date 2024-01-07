import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  DesignerState,
  getCurrentFilePath,
  getTargetExprId,
  redirect,
  setSelectedNodeBounds,
} from "@paperclip-ui/designer/src/state";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import produce from "immer";
import { get } from "lodash";
import { ShortcutCommand } from "../../shortcuts/state";

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
    case "shortcuts/itemSelected": {
      return produce(state, (draft) => {
        if (event.payload.command === ShortcutCommand.RenameLayer) {
          draft.renameSelectedLayer = true;
        }
      });
    }
    case "ui/IDFieldBlurred": {
      return produce(state, (draft) => {
        draft.renameSelectedLayer = false;
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
      return redirect(
        state,
        routes.editor({
          filePath: getCurrentFilePath(state),
          nodeId: getTargetExprId(state),
          variantIds: event.payload,
        })
      );
    }
    case "ui/boundsChanged": {
      state = setSelectedNodeBounds(event.payload.newBounds, state);
      return state;
    }
  }
  return state;
};
