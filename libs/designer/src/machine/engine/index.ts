import { combineEngineCreators } from "@paperclip-ui/common";
import { EditorState } from "../state";
import { createDesignerEngine, DesignerEngineOptions } from "./designer/engine";

export const createEngine = (options: DesignerEngineOptions) =>
  combineEngineCreators<EditorState, any>(createDesignerEngine(options));
