import { Dispatch, Engine } from "@paperclip-ui/common";
import { HistoryEngineEvent } from "./events";
import { History } from "./history";
import { getHistoryState, HistoryEngineState } from "./state";
import { DesignerState } from "../../state";
import { isEqual } from "lodash";

export const createHistoryEngine =
  (history: History) =>
  (
    dispatch: Dispatch<HistoryEngineEvent>
  ): Engine<HistoryEngineState, HistoryEngineEvent> => {
    history.onChange(() => {
      dispatch({
        type: "history-engine/historyChanged",
        payload: getHistoryState(),
      });
    });

    const handleEvent = (
      event: any,
      state: DesignerState,
      prevState: DesignerState
    ) => {
      if (
        isEqual(state.history, prevState.history) ||
        isEqual(getHistoryState(), state.history)
      ) {
        return;
      }

      history.redirect(stringifyHistory(state.history));
    };
    const dispose = () => {};

    return {
      handleEvent,
      dispose,
    };
  };

const stringifyHistory = (history: DesignerState["history"]) => {
  let path = history.pathname;
  if (Object.keys(history.query).length > 0) {
    path +=
      "?" +
      Object.entries(history.query)
        .map(([key, value]) => `${key}=${encodeURIComponent(String(value))}`)
        .join("&");
  }

  return path;
};
