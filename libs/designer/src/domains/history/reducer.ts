import produce from "immer";
import { DesignerEvent } from "../../events";
import { DesignerState, resetCurrentDocument } from "../../state";

export const historyReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "history-engine/historyChanged":
      state = produce(state, (newState) => {
        newState.history = event.payload;
      });
      state = resetCurrentDocument(state);

      return state;
  }
  return state;
};
