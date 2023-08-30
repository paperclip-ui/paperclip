import { BaseEvent } from "@paperclip-ui/common";

type KeyDown = BaseEvent<
  "keyDown",
  {
    caretPosition: number;
    value: string;
  }
>;

type InputClicked = BaseEvent<
  "inputClicked",
  {
    caretPosition: number;
  }
>;

type SuggestionMenuClose = BaseEvent<"suggestionMenuClose">;

type Blurred = BaseEvent<"blurred">;
type Focused = BaseEvent<
  "focused",
  {
    caretPosition: number;
  }
>;
type SuggestionSelected = BaseEvent<
  "suggestionSelected",
  {
    value: string;
  }
>;

export type DeclarationValueEvent =
  | KeyDown
  | Blurred
  | InputClicked
  | Focused
  | SuggestionSelected
  | SuggestionMenuClose;
