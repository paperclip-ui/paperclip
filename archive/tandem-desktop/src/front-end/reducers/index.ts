import { DesktopRootState } from "../state";
import { Action } from "redux";
// import { SERVER_STATE_LOADED, ServerStateLoaded } from "../actions";

export const rootReducer = (
  state: DesktopRootState,
  event: Action
): DesktopRootState => {
  // switch (event.type) {
  //   case SERVER_STATE_LOADED: {
  //     const { state: serverState } = event as ServerStateLoaded;
  //     return {
  //       ...state,
  //       serverState
  //     };
  //   }
  // }
  return state;
};
