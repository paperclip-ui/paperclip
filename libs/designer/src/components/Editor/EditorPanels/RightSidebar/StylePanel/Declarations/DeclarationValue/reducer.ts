import {
  State,
  getPathNamespace,
  selectActiveToken,
  replaceActiveToken,
} from "./state";
import { DeclarationValueEvent } from "./events";
import produce from "immer";
import { getTokenValue } from "./utils";

export const reducer = (state: State, event: DeclarationValueEvent) => {
  switch (event.type) {
    case "focused": {
      return produce(state, (draft) => {
        draft.caretPosition = event.payload.caretPosition;
        draft.showSuggestionMenu = true;
        draft.active = true;
      });
    }
    case "suggestionMenuClose": {
      return produce(state, (draft) => {
        draft.showSuggestionMenu = false;
      });
    }
    case "propsValueChanged": {
      return produce(state, (draft) => {
        if (draft.value !== event.payload) {
          draft.caretPosition = 0;
          draft.selectionLength = null;
          draft.showSuggestionMenu = false;
          draft.value = event.payload;
        }
      });
    }
    case "customInputChanged": {
      state = replaceActiveToken(event.payload, state, "all");
      return state;
    }
    case "customInputChangeComplete": {
      state = replaceActiveToken(event.payload, state, "all");
      return state;
    }
    case "inputClicked": {
      state = produce(state, (draft) => {
        draft.active = true;
        draft.showSuggestionMenu = true;
        draft.caretPosition = event.payload.caretPosition;
        Object.assign(draft, selectActiveToken(draft));
      });

      return state;
    }
    case "suggestionSelected": {
      state = replaceActiveToken(event.payload.item.value, state, "picked");

      return produce(state, (draft) => {
        if (event.payload.item.source) {
          draft.imports = Object.assign({}, draft.imports, {
            [getPathNamespace(event.payload.item.source)]:
              event.payload.item.source,
          });
        }
      });
    }
    case "keyUp": {
      return produce(state, (draft) => {
        draft.caretPosition = event.payload.caretPosition;
        draft.value = event.payload.value;
      });
    }
    case "keyDown": {
      return produce(state, (draft) => {
        if (
          event.payload.key === "ArrowDown" ||
          event.payload.key === "ArrowUp"
        ) {
          draft.showSuggestionMenu = true;
          draft.selectionLength = event.payload.selectionLength;
          Object.assign(draft, selectActiveToken(draft));
        } else if (event.payload.key === "Escape") {
          draft.showSuggestionMenu = false;
        } else {
          // otherwise, want to maintain selection because of cases like ctrl + a
          // and other key combos
          draft.caretPosition = event.payload.selectionStart;
          draft.selectionLength = event.payload.selectionLength;
        }
      });
    }
    case "blurred": {
      return produce(state, (draft) => {
        draft.caretPosition = -1;
        draft.active = false;
      });
    }
    case "textInputChanged": {
      return produce(state, (draft) => {
        draft.value = event.payload;

        // native behavior is prefered, but we have
        // strict control over caret position, so we
        // should set at the end of the value as it
        // would be native.
        draft.caretPosition = draft.value.length;
      });
    }
  }

  return state;
};
