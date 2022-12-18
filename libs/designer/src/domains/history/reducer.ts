import produce from "immer";
import { DesignerState } from "../../state";
import { HistoryEngineEvent } from "./events";

export const historyReducer = (
  state: DesignerState,
  event: HistoryEngineEvent
) => {
  switch (event.type) {
    case "history-engine/historyChanged":
      return produce(state, (newState) => {
        newState.history = event.payload;
      });
  }
  return state;
};
