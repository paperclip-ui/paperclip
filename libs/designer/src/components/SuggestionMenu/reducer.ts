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
      console.log("KEYD WON", event.payload.key, event.payload.menuLength);

      return produce(state, (draft) => {
        switch (event.payload.key) {
          case "Enter":
          case "Tab": {
            draft.isOpen = false;
            break;
          }
          case "ArrowDown": {
            draft.isOpen = true;

            if (draft.preselectedIndex === -1) {
              draft.preselectedIndex = event.payload.firstSelectedIndex;
            }

            console.log(draft.preselectedIndex);

            if (isOpen(draft)) {
              draft.preselectedIndex = Math.min(
                draft.preselectedIndex + 1,
                event.payload.menuLength - 1
              );
            }
            break;
          }
          case "ArrowUp": {
            draft.isOpen = true;
            if (draft.preselectedIndex === -1) {
              draft.preselectedIndex = event.payload.firstSelectedIndex;
            }
            if (isOpen(draft)) {
              draft.preselectedIndex = Math.max(draft.preselectedIndex - 1, 0);
            }
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

        // reset
        if (!isOpen(draft)) {
          draft.preselectedIndex = -1;
        }
      });
    }
  }
  return state;
};
