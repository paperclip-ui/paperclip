import { apiReducer } from "../domains/api/reducer";
import { historyReducer } from "../domains/history/reducer";
import { legacyReducer } from "../domains/legacy/reducer";
import { shortcutReducer } from "../domains/shortcuts/reducer";
import { uiReducer } from "../domains/ui/reducers";
import { DesignerEvent } from "../events";
import { DesignerState } from "../state";

const domainReducers = [
  legacyReducer,
  shortcutReducer,
  uiReducer,
  apiReducer,
  historyReducer,
];

export const rootReducer = (state: DesignerState, event: DesignerEvent) =>
  domainReducers.reduce((state, reduce) => reduce(state, event), state);
