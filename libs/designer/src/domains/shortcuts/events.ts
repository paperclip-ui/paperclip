import { eventCreators, ExtractEventFromCreators } from "@paperclip-ui/common";

export const shortcutEvents = eventCreators(
  {
    selectedConvertToComponent: null,
    selectedCut: null,
    selectedCopy: null,
    selectedPaste: null,
  },
  "shortcuts"
);

export type ShortcutEvent = ExtractEventFromCreators<typeof shortcutEvents>;
