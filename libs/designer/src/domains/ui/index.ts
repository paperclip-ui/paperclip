import { DesignerEvent } from "../../events";
import { DesignerState } from "../../state";
import { resourceModalReducer } from "./resource-modal";

export const uiReducer = (state: DesignerState, event: DesignerEvent) => {
  state = resourceModalReducer(state, event);
  return state;
};
