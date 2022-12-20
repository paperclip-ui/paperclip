import { BaseEvent, eventCreators, identity } from "@paperclip-ui/common";

export type Started = BaseEvent<"server/started", { port: number }>;
export type FileChanged = BaseEvent<
  "server/fileChanged",
  { path: string; content: string }
>;

export type ServerEvent = Started | FileChanged;
