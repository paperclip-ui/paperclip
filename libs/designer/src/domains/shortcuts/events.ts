import { eventCreators, ExtractEventFromCreators } from "@paperclip-ui/common";

export const shortcutEvents = eventCreators(
  {
    insertElement: null,
    insertText: null,
    convertToComponent: null,
    cut: null,
    copy: null,
    paste: null,
  },
  "shortcuts"
);

export type ShortcutEvent = ExtractEventFromCreators<typeof shortcutEvents>;
