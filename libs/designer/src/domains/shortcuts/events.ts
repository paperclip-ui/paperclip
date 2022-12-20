import { BaseEvent } from "@paperclip-ui/common";
import { ShortcutCommand } from "./state";

export type ItemSelected = BaseEvent<
  "shortcuts/itemSelected",
  { command: ShortcutCommand }
>;

export type ShortcutEvent = ItemSelected;
