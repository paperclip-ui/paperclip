import { Action } from "redux";
import { RootState } from "../../state";
import { projectReducer } from "./project";

export const engineReducer = (state: RootState, action: Action): RootState => {
  state = projectReducer(state, action);

  return state;
};
