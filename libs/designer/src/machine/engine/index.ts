import { combineEngineCreators, EngineCreator } from "@paperclip-ui/common";
import { EditorState } from "../state";
import { createDesignerEngine, DesignerEngineOptions } from "./designer/engine";
import { createHistoryEngine } from "./history/engine";

export const createEngine = (
  options: DesignerEngineOptions,
  ...otherEngineCreators: EngineCreator<any, any>[]
) =>
  combineEngineCreators<EditorState, any>(
    createDesignerEngine(options),
    createHistoryEngine,
    ...otherEngineCreators
  );
