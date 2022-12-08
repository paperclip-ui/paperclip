import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";
import { ShortcutCommand } from "./state";

export const shortcutEvents = eventCreators(
  {
    itemSelected: identity<{ command: ShortcutCommand }>(),
  },
  "shortcuts"
);

export type ShortcutEvent = ExtractEventFromCreators<typeof shortcutEvents>;
