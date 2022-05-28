import { Action } from "redux";
import { RootState } from "../../state";
import { fileNavigatorReducer } from "./file-navigator";

export const uiReducer = (state: RootState, action: Action): RootState => {
  state = fileNavigatorReducer(state, action);
  return state;
};
