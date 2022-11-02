import { combineEngineCreators } from "@paperclip-ui/common";
import { EditorState } from "../state";
import { createDesignerEngine } from "./designer/engine";

export const createEngine = combineEngineCreators<EditorState, any>(
  createDesignerEngine
);
