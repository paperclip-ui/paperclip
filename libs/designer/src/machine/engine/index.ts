import { combineEngineCreators, EngineCreator } from "@paperclip-ui/common";
import { EditorState } from "../state";
import { createDesignerEngine, DesignerEngineOptions } from "./designer/engine";
import { DesignerEngineEvent } from "./designer/events";
import { DesignerEngineState } from "./designer/state";

export const createEngine = (
  options: DesignerEngineOptions,
  ...otherEngineCreators: EngineCreator<any, any>[]
) =>
  combineEngineCreators<EditorState, any>(
    createDesignerEngine(options),
    ...otherEngineCreators
  );
