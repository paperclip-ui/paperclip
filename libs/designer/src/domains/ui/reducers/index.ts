import { DesignerEvent } from "../../../events";
import { DesignerState } from "../../../state";
import { canvasReducer } from "./canvas";
import { leftSidebarReducer } from "./left-sidebar";
import { promptReducer } from "./prompt";
import { resourceModalReducer } from "./resource-modal";
import { rightSidebarReducer } from "./right-sidebar";

const reducers = [
  resourceModalReducer,
  leftSidebarReducer,
  canvasReducer,
  rightSidebarReducer,
  promptReducer,
];

export const uiReducer = (state: DesignerState, event: DesignerEvent) =>
  reducers.reduce((state, reduce) => reduce(state, event), state);
