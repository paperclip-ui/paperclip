import { State, getPathNamespace, getTokenAtCaret } from "./state";
import { DeclarationValueEvent } from "./events";
import produce from "immer";
import { getTokenValue } from "./utils";
import { stat } from "fs-extra";
import { WritableDraft } from "immer/dist/internal";

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
      state = replaceActiveToken(event.payload.value, state, "all");
      return state;
    }
    case "customInputChangeComplete": {
      state = replaceActiveToken(event.payload.value, state, "all");
      return state;
    }
    case "inputClicked": {
      return produce(state, (draft) => {
        draft.active = true;
        draft.showSuggestionMenu = true;
        draft.caretPosition = event.payload.caretPosition;
        const activeToken = getTokenAtCaret(draft);
        if (activeToken) {
          draft.caretPosition = activeToken.pos;
          draft.selectionLength = getTokenValue(activeToken).length;
        }
      });
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
