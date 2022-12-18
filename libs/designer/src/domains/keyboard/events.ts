import { BaseEvent } from "@paperclip-ui/common";

export type KeyDown = BaseEvent<
  "keyboard/keyDown",
  {
    key: string;
    shiftKey: boolean;
    metaKey: boolean;
    ctrlKey: boolean;
    altKey: boolean;
  }
>;

export const createKeyDownEvent = ({
  key,
  shiftKey,
  metaKey,
  ctrlKey,
  altKey,
}: KeyboardEvent): KeyDown => ({
  type: "keyboard/keyDown",
  payload: {
    key,
    shiftKey,
    metaKey,
    ctrlKey,
    altKey,
  },
});

export type KeyboardEngineEvent = KeyDown;
