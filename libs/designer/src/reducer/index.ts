import { Designer } from "../../test/controls";
import { EditorEvent } from "../events";
import { EditorState } from "../state";
import { editorReducer } from "./editor";

export const rootReducer = (state: EditorState, event: EditorEvent) => {
  return editorReducer(state, event);
};
