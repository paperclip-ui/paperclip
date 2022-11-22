import {
  eventCreators,
  identity,
  ExtractEventFromCreators,
} from "@paperclip-ui/common";

export const historyEngineEvents = eventCreators(
  {
    historyChanged: identity<{ pathname: string; query: any }>(),
  },
  "history-engine"
);

export type HistoryEngineEvent = ExtractEventFromCreators<
  typeof historyEngineEvents
>;
