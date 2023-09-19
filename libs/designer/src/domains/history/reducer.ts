import produce from "immer";
import { DesignerEvent } from "../../events";
import {
  DesignerState,
  getCurrentFilePath,
  getTargetExprId,
  resetCurrentDocument,
} from "../../state";
import { maybeCenterCanvas } from "../ui/state";

export const historyReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "history-engine/historyChanged":
      const prevPath = getCurrentFilePath(state);

      state = produce(state, (newState) => {
        newState.history = event.payload;
        newState.redirect = null;
      });

      const newPath = getCurrentFilePath(state);

      if (newPath !== prevPath) {
        state = resetCurrentDocument(state);
      }

      if (newPath == null) {
        state.renderedFilePath = null;
      }

      if (state.centerOnRedirect) {
        state = produce(state, (draft) => {
          draft.centerOnRedirect = false;
        });
        state = maybeCenterCanvas(state, true);
      }

      return state;
  }
  return state;
};
