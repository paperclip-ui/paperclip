import { EngineActionHandler } from "tandem-common";
import { Action } from "redux";
import { RootState } from "../state";
import { Dispatch } from "react";
import { rootClicked } from "../actions";
import { isDirty } from "fsbox";

export const globalsEngine = (
  dispatch: Dispatch<Action>
): EngineActionHandler<RootState> => {
  let _currentState: RootState;

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
    if (!state.confirm || state.confirm === prevState.confirm) {
      return;
    }
    alert(state.confirm.message);
  };

  window.onbeforeunload = () => {
    if (!_currentState) {
      return;
    }
    if (Object.values(_currentState.fileCache).some(isDirty)) {
      return `You have unsaved files. Are you sure you want to leave?`;
    }
  };

  return (action: Action, state: RootState, prevState: RootState) => {
    _currentState = state;

    handleConfirm(action, state, prevState);
  };
};
