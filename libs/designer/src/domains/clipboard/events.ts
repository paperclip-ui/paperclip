import { BaseEvent } from "@paperclip-ui/common";

export type ExpressionPasted = BaseEvent<
  "clipboard/expressionPasted",
  { expr: any }
>;

export type ClipboardEvent = ExpressionPasted;
