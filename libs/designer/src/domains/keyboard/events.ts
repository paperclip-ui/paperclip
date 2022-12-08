import {
  eventCreators,
  ExtractEventFromCreators,
  identity,
} from "@paperclip-ui/common";

export const keyboardEvents = eventCreators(
  {
    keyDown: identity<{
      key: string;
      shiftKey: boolean;
      metaKey: boolean;
      ctrlKey: boolean;
      altKey: boolean;
    }>(),
  },
  "keyboard"
);

export type KeyboardEvent = ExtractEventFromCreators<typeof keyboardEvents>;
