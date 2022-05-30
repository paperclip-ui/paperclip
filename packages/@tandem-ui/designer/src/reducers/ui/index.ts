import { Action } from "redux";
import { RootState } from "../../state";
import { contextMenuReducer } from "./context-menu";
import { contextMenuActionReducer } from "./context-menu-action";
import { fileNavigatorReducer } from "./file-navigator";
import { quickSearchReducer } from "./quick-search";

export const uiReducer = (state: RootState, action: Action): RootState => {
  state = fileNavigatorReducer(state, action);
  state = contextMenuReducer(state, action);
  state = quickSearchReducer(state, action);
  state = contextMenuActionReducer(state, action);
  return state;
};
