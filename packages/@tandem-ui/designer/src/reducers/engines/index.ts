import { Action } from "redux";
import { RootState } from "../../state";
import { projectReducer } from "./project";
import { quickSearchReducer } from "./quick-search";
import { shortcutReducer } from "./shortcuts";

export const engineReducer = (state: RootState, action: Action): RootState => {
  state = projectReducer(state, action);
  state = quickSearchReducer(state, action);
  state = shortcutReducer(state, action);
  return state;
};
