import { designerEngineEvents } from "../../engine/designer/events";
import { EditorEvent, editorEvents } from "../../events";
import { EditorState } from "../../state";
import produce from "immer";

export const editorReducer = (
  state: EditorState,
  event: EditorEvent
): EditorState => {
  console.log(event);
  switch (event.type) {
    case designerEngineEvents.documentOpened.type:
      return produce(state, (newState) => {
        newState.curentDocument = event.payload.toObject();
      });
    case editorEvents.rectsCaptured.type:
      return produce(state, (newState) => {
        newState.rects[event.payload.frameIndex] = event.payload.rects;
      });
  }
  return state;
};
