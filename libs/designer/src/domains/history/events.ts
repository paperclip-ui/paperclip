import { BaseEvent } from "@paperclip-ui/common";

export type HistoryChanged = BaseEvent<
  "history-engine/historyChanged",
  { pathname: string; query: any }
>;

export type HistoryEngineEvent = HistoryChanged;
