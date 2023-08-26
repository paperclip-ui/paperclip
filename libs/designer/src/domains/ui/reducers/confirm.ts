import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { DesignerState } from "@paperclip-ui/designer/src/state";
import produce from "immer";

export const confirmReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "ui/confirmClosed": {
      return produce(state, (newState) => {
        newState.confirm = null;
      });
    }
  }
  return state;
};
