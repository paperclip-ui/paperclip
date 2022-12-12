import produce from "immer";
import { DesignerEvent, designerEvents } from "../../events";
import { DesignerState } from "../../state";

export const resourceModalReducer = (
  state: DesignerState,
  event: DesignerEvent
) => {
  switch (event.type) {
    case designerEvents.resourceModalBackgroundClicked.type: {
      return produce(state, (newState) => {
        newState.insertMode = null;
      });
    }
  }
  return state;
};
