import { DesignerEvent } from "../../../events";
import { DesignerState } from "../../../state";
import { resourceModalReducer } from "./resource-modal";
import { toolsLayerReducer } from "./toolsLayer";

export const uiReducer = (state: DesignerState, event: DesignerEvent) => {
  state = resourceModalReducer(state, event);
  state = toolsLayerReducer(state, event);
  return state;
};
