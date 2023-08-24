import produce from "immer";
import { DesignerEvent } from "../../events";
import {
  DesignerState,
  getCurrentFilePath,
  getTargetExprId,
  resetCurrentDocument,
} from "../../state";

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

      return state;
  }
  return state;
};
