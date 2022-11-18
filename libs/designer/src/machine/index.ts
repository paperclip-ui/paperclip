import { machineCreator } from "@paperclip-ui/common";
import { createEngine } from "./engine";
import { DesignerEngineOptions } from "./engine/designer/engine";
import { rootReducer } from "./reducer";

export const createEditorMachine = (options: DesignerEngineOptions) =>
  machineCreator(rootReducer, createEngine(options));
