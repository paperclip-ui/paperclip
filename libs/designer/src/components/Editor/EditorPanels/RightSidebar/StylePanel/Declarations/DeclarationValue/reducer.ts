import { State, getTokenAtCaret } from "./state";
import { DeclarationValueEvent } from "./events";
import produce from "immer";
import { getTokenValue } from "./utils";

export const reducer = (state: State, event: DeclarationValueEvent) => {
  switch (event.type) {
    case "focused": {
      return produce(state, (draft) => {
        draft.caretPosition = event.payload.caretPosition;
        draft.showSuggestionMenu = true;
      });
    }
    case "suggestionMenuClose": {
      return produce(state, (draft) => {
        draft.showSuggestionMenu = false;
      });
    }
    case "suggestionSelected": {
      return produce(state, (draft) => {
        const token = getTokenAtCaret(state);
        const newValue =
          state.value.slice(0, token.pos) +
          event.payload.value +
          state.value.slice(token.pos + getTokenValue(token).length);
        let caretPosition = newValue.indexOf("%|%");
        if (caretPosition === -1) {
          caretPosition = token.pos + event.payload.value.length;
        }
        draft.caretPosition = caretPosition;
        draft.value = newValue.replace("%|%", "");
      });
    }
    case "keyDown": {
      return produce(state, (draft) => {
        draft.caretPosition = event.payload.caretPosition;
        draft.value = event.payload.value;
      });
    }
    case "blurred": {
      return produce(state, (draft) => {
        draft.caretPosition = -1;
      });
    }
  }

  return state;
};
