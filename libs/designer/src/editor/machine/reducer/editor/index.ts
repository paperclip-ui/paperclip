import { designerEngineEvents } from "../../engine/designer/events";
import { EditorEvent } from "../../events";
import { EditorState } from "../../state";
import produce from "immer";

export const editorReducer = (state: EditorState, event: EditorEvent) => {
  switch (event.type) {
    case designerEngineEvents.documentOpened.type:
      return produce(state, (newState) => {
        newState.curentDocument = event.payload;
      });
  }
  return event;
};
