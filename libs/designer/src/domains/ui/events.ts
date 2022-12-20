import { BaseEvent } from "@paperclip-ui/common";

export type DashboardAddFileConfirmed = BaseEvent<
  "ui/dashboardAddFileConfirmed",
  { name: string }
>;

export type ToolsTextEditorChanged = BaseEvent<
  "ui/toolsTextEditorChanged",
  { text: string }
>;

export type UIEvent = DashboardAddFileConfirmed | ToolsTextEditorChanged;
