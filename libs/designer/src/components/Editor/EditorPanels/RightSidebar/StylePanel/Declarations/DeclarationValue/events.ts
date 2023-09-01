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

    // ctrl + a may have been selected. Want to preserve that
    selectionStart: number;
    selectionLength: number;
  }
>;

type InputClicked = BaseEvent<
  "inputClicked",
  {
    caretPosition: number;
  }
>;

type CustomInputChanged = BaseEvent<"customInputChanged", string>;

type TextInputChanged = BaseEvent<"textInputChanged", string>;

type CustomInputChangeComplete = BaseEvent<"customInputChangeComplete", string>;

type CustomSelected = BaseEvent<"customSelected", string>;

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
  | TextInputChanged
  | CustomInputChanged
  | CustomInputChangeComplete
  | Focused
  | SuggestionSelected
  | SuggestionMenuClose;
