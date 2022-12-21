import { DesignerEvent } from "../../../events";
import { DesignerState } from "../../../state";
import { canvasReducer } from "./canvas";
import { resourceModalReducer } from "./resource-modal";
import { rightSidebarReducer } from "./right-sidebar";
import { toolsLayerReducer } from "./toolsLayer";

const reducers = [
  resourceModalReducer,
  toolsLayerReducer,
  canvasReducer,
  rightSidebarReducer,
];

export const uiReducer = (state: DesignerState, event: DesignerEvent) =>
  reducers.reduce((state, reduce) => reduce(state, event), state);
