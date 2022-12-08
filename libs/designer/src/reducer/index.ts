import { legacyReducer } from "../domains/legacy/reducer";
import { shortcutReducer } from "../domains/shortcuts/reducer";
import { DesignerEvent } from "../events";
import { DesignerState } from "../state";

const domainReducers = [legacyReducer, shortcutReducer];

export const rootReducer = (state: DesignerState, event: DesignerEvent) =>
  domainReducers.reduce((state, reduce) => reduce(state, event), state);
