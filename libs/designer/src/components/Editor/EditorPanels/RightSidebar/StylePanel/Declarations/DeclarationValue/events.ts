import { BaseEvent } from "@paperclip-ui/common";
import { RawInputValueSuggestionItem } from "./state";

type KeyUp = BaseEvent<
  "keyUp",
  {
    caretPosition: number;
    value: string;
  }
>;

type KeyDown = BaseEvent<
  "keyDown",
  {
    key: string;
  }
>;

type InputClicked = BaseEvent<
  "inputClicked",
  {
    caretPosition: number;
  }
>;

type CustomInputChanged = BaseEvent<
  "customInputChanged",
  {
    value: string;
  }
>;

type CustomInputChangeComplete = BaseEvent<
  "customInputChangeComplete",
  {
    value: string;
  }
>;

type CustomSelected = BaseEvent<
  "customSelected",
  {
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
    item: RawInputValueSuggestionItem;
  }
>;

export type DeclarationValueEvent =
  | KeyDown
  | KeyUp
  | Blurred
  | CustomSelected
  | InputClicked
  | CustomInputChanged
  | CustomInputChangeComplete
  | Focused
  | SuggestionSelected
  | SuggestionMenuClose;
