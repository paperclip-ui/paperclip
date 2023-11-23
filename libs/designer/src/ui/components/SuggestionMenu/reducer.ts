import { State, isOpen } from "./state";
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
        draft.isOpen = true;
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
            if (draft.preselectedIndex === -1) {
              draft.preselectedIndex = event.payload.firstSelectedIndex ?? -1;
            }

            if (isOpen(draft)) {
              draft.preselectedIndex = Math.min(
                draft.preselectedIndex + 1,
                event.payload.menuLength - 1
              );
            }

            draft.isOpen = true;
            break;
          }
          case "ArrowUp": {
            if (draft.preselectedIndex === -1) {
              draft.preselectedIndex = event.payload.firstSelectedIndex ?? -1;
            }
            if (isOpen(draft)) {
              draft.preselectedIndex = Math.max(draft.preselectedIndex - 1, 0);
            }
            draft.isOpen = true;
            break;
          }
        }
      });
    }
    case "focused": {
      return produce(state, (draft) => {
        draft.isOpen = true;
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
        if (!isOpen(draft)) {
          draft.preselectedIndex = -1;

          // reset custom value so that if menu opens again
          // user must type to filter. OTHERWISE the full
          // list isn't displayed.
          draft.customValue = null;
        }
      });
    }
  }
  return state;
};
