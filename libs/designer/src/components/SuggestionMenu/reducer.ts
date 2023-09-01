import { State } from "./state";
import { SuggestionMenuEvent } from "./events";
import produce from "immer";

export const reducer = (state: State, event: SuggestionMenuEvent) => {
  switch (event.type) {
    case "selected":
    case "blurred": {
      return produce(state, (draft) => {
        draft.isOpen = false;
        draft.customValue = null;
      });
    }
    case "inputChanged": {
      return produce(state, (draft) => {
        draft.customValue = event.payload;
      });
    }
    case "keyDown": {
      return produce(state, (draft) => {
        switch (event.payload.key) {
          case "Enter":
          case "Tab": {
            draft.isOpen = false;
            break;
          }
          case "ArrowDown": {
            draft.isOpen = true;
            draft.preselectedIndex = Math.min(
              draft.preselectedIndex + 1,
              event.payload.menuLength - 1
            );
            break;
          }
          case "ArrowUp": {
            draft.isOpen = true;
            draft.preselectedIndex = Math.max(draft.preselectedIndex - 1, 0);
            break;
          }
        }
      });
    }
    case "inputClicked": {
      return produce(state, (draft) => {
        draft.isOpen = true;
      });
    }
    case "propsChanged": {
      return produce(state, (draft) => {
        draft.props = event.payload;
      });
    }
  }
  return state;
};
