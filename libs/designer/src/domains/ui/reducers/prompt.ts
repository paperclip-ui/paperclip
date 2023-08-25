import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { DesignerState } from "@paperclip-ui/designer/src/state";
import produce from "immer";

export const promptReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "ui/promptClosed": {
      return produce(state, (newState) => {
        newState.prompt = null;
      });
    }
  }
  return state;
};
