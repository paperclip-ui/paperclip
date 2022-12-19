import { BaseEvent } from "@paperclip-ui/common";

export type DashboardAddFileConfirmed = BaseEvent<
  "ui/dashboardAddFileConfirmed",
  { name: string }
>;

export type UIEvent = DashboardAddFileConfirmed;
