// behold the ~~blob~~

import { Action } from "redux";
import { uiReducer } from "./ui";
import { engineReducer } from "./engines";
import { legacyReducer } from "./legacy";
import { RootState } from "../state";

export const rootReducer = (state: RootState, action: Action): RootState => {
  state = legacyReducer(state, action);
  state = engineReducer(state, action);
  state = uiReducer(state, action);
  return state;
};
