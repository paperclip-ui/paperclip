import { State } from "./state";
import { DeclarationValueEvent } from "./events";
import produce from "immer";

export const reducer = (state: State, event: DeclarationValueEvent) => {
  switch (event.type) {
    case "inputChanged": {
      return produce(state, (draft) => {
        draft.value = event.payload.value;
      });
    }
    case "keyDown": {
      return produce(state, (draft) => {
        draft.caretPosition = event.payload.caretPosition;
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
