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

type PropsChanged = BaseEvent<
  "propsChanged",
  { value: string; autoFocus: boolean }
>;
type CustomInputChanged = BaseEvent<"customInputChanged", string>;

type TextInputChanged = BaseEvent<
  "textInputChanged",
  {
    value: string;
    caretPosition: number;
  }
>;

type CustomInputChangeComplete = BaseEvent<"customInputChangeComplete", string>;

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
  | InputClicked
  | TextInputChanged
  | PropsChanged
  | CustomInputChanged
  | CustomInputChangeComplete
  | Focused
  | SuggestionSelected
  | SuggestionMenuClose;
