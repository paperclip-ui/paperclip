import { EngineActionHandler } from "tandem-common";
import { Action } from "redux";
import { RootState } from "../state";
import { Dispatch } from "react";
import { rootClicked } from "../actions";

export const globalsEngine = (
  dispatch: Dispatch<Action>
): EngineActionHandler<RootState> => {
  document.addEventListener(
    "wheel",
    (event: WheelEvent) => {
      // zooming?
      if (event.metaKey) {
        event.preventDefault();
      }
    },
    { passive: false }
  );

  document.addEventListener("click", () => {
    dispatch(rootClicked());
  });

  const handleConfirm = (
    action: Action,
    state: RootState,
    prevState: RootState
  ) => {
    if (state.confirm && state.confirm === prevState.confirm) {
      return;
    }
    alert(state.confirm.message);
  };

  return (action: Action, state: RootState, prevState: RootState) => {
    handleConfirm(action, state, prevState);
  };
};
