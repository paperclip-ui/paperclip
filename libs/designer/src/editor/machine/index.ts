import { machineCreator } from "@paperclip-ui/common";
import { createEngine } from "./engine";
import { rootReducer } from "./reducer";

export const createEditorMachine = machineCreator(rootReducer, createEngine);
