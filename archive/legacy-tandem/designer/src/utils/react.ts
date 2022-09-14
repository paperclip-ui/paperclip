import { Dispatch, ActionCreator } from "redux";

export const wrapEventToDispatch =
  (dispatch: Dispatch<any>, actionCreator: ActionCreator<any>) => (event) =>
    dispatch(actionCreator(event));
