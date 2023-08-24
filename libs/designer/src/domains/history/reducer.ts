import produce from "immer";
import { DesignerEvent } from "../../events";
import {
  DesignerState,
  getCurrentFilePath,
  resetCurrentDocument,
} from "../../state";

export const historyReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "history-engine/historyChanged":
      const prevPath = getCurrentFilePath(state);
      state.redirect = null;

      state = produce(state, (newState) => {
        newState.history = event.payload;
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
