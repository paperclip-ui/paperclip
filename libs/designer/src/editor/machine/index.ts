import { machineCreator } from "../modules/machine";
import { createEngine } from "./engine";
import { rootReducer } from "./reducer";

export const createEditorMachine = machineCreator(rootReducer, createEngine);
