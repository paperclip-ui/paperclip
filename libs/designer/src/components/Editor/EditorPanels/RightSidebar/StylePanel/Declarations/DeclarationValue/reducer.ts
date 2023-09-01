import { State, getPathNamespace, getTokenAtCaret } from "./state";
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

const replaceActiveToken = (
  value: string,
  state: State,
  selectionBehavior?: "beginning" | "picked" | "all"
) => {
  return produce(state, (draft) => {
    const token = getTokenAtCaret(state);

    const newValue =
      state.value.slice(0, token.pos) +
      value +
      state.value.slice(token.pos + getTokenValue(token).length);
    let pickedCaretPosition = newValue.indexOf("%|%");
    if (pickedCaretPosition === -1) {
      pickedCaretPosition = token.pos + value.length;
    }

    if (selectionBehavior) {
      if (selectionBehavior === "beginning") {
        draft.caretPosition = token.pos;
        draft.selectionLength = 0;
      } else if (selectionBehavior === "picked") {
        draft.caretPosition = pickedCaretPosition;
        draft.selectionLength = 0;
      } else if (selectionBehavior === "all") {
        draft.caretPosition = token.pos;
        draft.selectionLength = value.length;
      }
    }

    draft.value = newValue.replace("%|%", "");
  });
};

const selectActiveToken = (state: State) => {
  return produce(state, (draft) => {
    const token = getTokenAtCaret(state);
    if (token) {
      draft.caretPosition = token.pos;
      draft.selectionLength = getTokenValue(token).length;
    }
  });
};
