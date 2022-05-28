import { Action, combineReducers } from "redux";
import { RootState } from "../../state";
import { contextMenuReducer } from "./context-menu";
import { fileNavigatorReducer } from "./file-navigator";
import { quickSearchReducer } from "./quick-search";

export const uiReducer = (state: RootState, action: Action): RootState => {
  state = fileNavigatorReducer(state, action);
  state = contextMenuReducer(state, action);
  state = quickSearchReducer(state, action);
  return state;
};
