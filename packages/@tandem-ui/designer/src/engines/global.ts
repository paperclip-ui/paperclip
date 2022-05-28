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

  return (action: Action, state: RootState) => {};
};
