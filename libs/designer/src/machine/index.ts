import { EngineCreator, machineCreator } from "@paperclip-ui/common";
import { createEngine, EngineOptions } from "../engine";
import { rootReducer } from "../reducer";

export const createEditorMachine = (
  options: EngineOptions,
  ...otherEngineCreators: EngineCreator<any, any>[]
) => machineCreator(rootReducer, createEngine(options, ...otherEngineCreators));
