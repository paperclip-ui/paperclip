import { BaseEvent } from "@paperclip-ui/common";

type KeyDown = BaseEvent<
  "keyDown",
  {
    caretPosition: number;
    value: string;
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
  | Focused
  | SuggestionSelected
  | SuggestionMenuClose;
