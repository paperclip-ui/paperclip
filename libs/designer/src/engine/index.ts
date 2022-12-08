import { combineEngineCreators, EngineCreator } from "@paperclip-ui/common";
import { EditorState } from "../state";
import {
  createDesignerEngine,
  DesignerEngineOptions,
} from "../domains/api/engine";
import { createHistoryEngine } from "../domains/history/engine";

export const createEngine = (
  options: DesignerEngineOptions,
  ...otherEngineCreators: EngineCreator<any, any>[]
) =>
  combineEngineCreators<EditorState, any>(
    createDesignerEngine(options),
    createHistoryEngine,
    ...otherEngineCreators
  );
