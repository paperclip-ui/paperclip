import { combineEngineCreators } from "../../modules/machine/engine";
import { EditorState } from "../state";
import { createDesignerEngine } from "./designer/engine";

export const createEngine = combineEngineCreators<EditorState, any>(
  createDesignerEngine
);
