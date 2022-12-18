import { combineEngineCreators, EngineCreator } from "@paperclip-ui/common";
import { DesignerState } from "../state";
import {
  createDesignerEngine,
  DesignerEngineOptions,
} from "../domains/api/engine";
import { createHistoryEngine } from "../domains/history/engine";
import { createKeyboardEngine } from "../domains/keyboard/engine";
import { History } from "../domains/history/history";
import { createShortcutsEngine } from "../domains/shortcuts/engine";

export type EngineOptions = {
  history: History;
} & DesignerEngineOptions;

export const createEngine = (
  options: EngineOptions,
  ...otherEngineCreators: EngineCreator<any, any>[]
) =>
  combineEngineCreators<DesignerState, any>(
    createDesignerEngine(options),
    createShortcutsEngine,
    createHistoryEngine(options.history),
    createKeyboardEngine,
    ...otherEngineCreators
  );
