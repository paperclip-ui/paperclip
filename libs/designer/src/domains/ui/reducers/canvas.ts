import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { DesignerState } from "@paperclip-ui/designer/src/state";
import produce from "immer";

export const canvasReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "editor/canvasResized":
      return produce(state, (newState) => {
        newState.canvas.size = event.payload;
      });
  }
  return state;
};
