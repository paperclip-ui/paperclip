import { State, getPathNamespace, getTokenAtCaret } from "./state";
import { DeclarationValueEvent } from "./events";
import produce from "immer";
import { getTokenValue } from "./utils";
import { stat } from "fs-extra";

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
    case "customInputChanged": {
      state = replaceActiveToken(event.payload.value, state, true);
      return state;
    }
    case "customInputChangeComplete": {
      state = replaceActiveToken(event.payload.value, state, true);
      return state;
    }
    case "inputClicked": {
      return produce(state, (draft) => {
        draft.showSuggestionMenu = true;
        draft.caretPosition = event.payload.caretPosition;
      });
    }
    case "suggestionSelected": {
      state = replaceActiveToken(event.payload.item.value, state, true);

      return produce(state, (draft) => {
        if (event.payload.item.source) {
          draft.imports = Object.assign({}, draft.imports, {
            [getPathNamespace(event.payload.item.source)]:
              event.payload.item.source,
          });
        }
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
        draft.active = false;
      });
    }
  }

  return state;
};

const replaceActiveToken = (
  value: string,
  state: State,
  setCaretPosition: boolean
) => {
  return produce(state, (draft) => {
    const token = getTokenAtCaret(state);

    const newValue =
      state.value.slice(0, token.pos) +
      value +
      state.value.slice(token.pos + getTokenValue(token).length);
    let caretPosition = newValue.indexOf("%|%");
    if (caretPosition === -1) {
      caretPosition = token.pos + value.length;
    }

    if (setCaretPosition) {
      draft.caretPosition = caretPosition;
    }
    draft.value = newValue.replace("%|%", "");
  });
};
