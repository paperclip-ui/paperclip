import { MenuItems } from "../menu/base";
import { EngineActionHandler } from "tandem-common";
import { Action } from "redux";
import { RootState } from "../state";
import { Dispatch } from "react";

export const fixesEngine = (
  dispatch: Dispatch<Action>
): EngineActionHandler<RootState> => {
  // prevent page zooming when zooming into the canvas
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

  return (action: Action, state: RootState) => {};
};
