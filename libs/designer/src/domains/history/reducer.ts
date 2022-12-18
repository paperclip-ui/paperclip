import produce from "immer";
import { DesignerState, resetCurrentDocument } from "../../state";
import { HistoryEngineEvent } from "./events";

export const historyReducer = (
  state: DesignerState,
  event: HistoryEngineEvent
) => {
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
