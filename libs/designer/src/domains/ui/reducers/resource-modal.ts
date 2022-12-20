import produce from "immer";
import { DesignerEvent } from "../../../events";
import { DesignerState } from "../../../state";

export const resourceModalReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case "editor/resourceModalBackgroundClicked": {
      return produce(state, (newState) => {
        newState.insertMode = null;
      });
    }
    case "editor/resourceModalDragLeft": {
      return produce(state, (newState) => {
        newState.resourceModalDragLeft = true;
      });
    }
  }
  return state;
};
