import { EngineCreator, machineCreator } from "@paperclip-ui/common";
import { createEngine } from "./engine";
import { DesignerEngineOptions } from "./engine/designer/engine";
import { DesignerEngineState } from "./engine/designer/state";
import { rootReducer } from "./reducer";

export const createEditorMachine = (
  options: DesignerEngineOptions,
  ...otherEngineCreators: EngineCreator<any, any>[]
) => machineCreator(rootReducer, createEngine(options, ...otherEngineCreators));
