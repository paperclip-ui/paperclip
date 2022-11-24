import { Dispatch, Engine } from "@paperclip-ui/common";
import { HistoryEngineEvent, historyEngineEvents } from "./events";
import { HistoryEngineState } from "./state";

export const createHistoryEngine = (
  dispatch: Dispatch<HistoryEngineEvent>
): Engine<HistoryEngineState, HistoryEngineEvent> => {
  const handleEvent = () => {};
  const dispose = () => {};
  return {
    handleEvent,
    dispose,
  };
};
