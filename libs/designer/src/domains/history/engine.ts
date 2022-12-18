import { Dispatch, Engine } from "@paperclip-ui/common";
import { HistoryEngineEvent } from "./events";
import { History } from "./history";
import { getHistoryState, HistoryEngineState } from "./state";

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

    const handleEvent = () => {};
    const dispose = () => {};

    return {
      handleEvent,
      dispose,
    };
  };
