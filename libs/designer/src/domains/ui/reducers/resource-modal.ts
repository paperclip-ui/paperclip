import produce from "immer";
import { DesignerEvent } from "../../../events";
import { DesignerState } from "../../../state";

export const resourceModalReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case "ui/resourceModalBackgroundClicked": {
      return produce(state, (newState) => {
        newState.insertMode = null;
      });
    }
    case "ui/resourceModalDragLeft": {
      return produce(state, (newState) => {
        newState.resourceModalDragLeft = true;
      });
    }
  }
  return state;
};
