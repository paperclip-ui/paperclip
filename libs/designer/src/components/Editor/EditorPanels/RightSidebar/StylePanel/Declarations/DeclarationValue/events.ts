import { BaseEvent } from "@paperclip-ui/common";

type KeyDown = BaseEvent<
  "keyDown",
  {
    caretPosition: number;
  }
>;

type Blurred = BaseEvent<"blurred">;
type Focused = BaseEvent<
  "focused",
  {
    caretPosition: number;
  }
>;

type InputChanged = BaseEvent<
  "inputChanged",
  {
    value: string;
  }
>;

export type DeclarationValueEvent = KeyDown | InputChanged | Blurred | Focused;
