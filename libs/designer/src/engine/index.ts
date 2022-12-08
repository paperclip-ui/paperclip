import { combineEngineCreators, EngineCreator } from "@paperclip-ui/common";
import { DesignerState } from "../state";
import {
  createDesignerEngine,
  DesignerEngineOptions,
} from "../domains/api/engine";
import { createHistoryEngine } from "../domains/history/engine";
import { createShortcutEngine } from "../domains/shortcuts/engine";

export const createEngine = (
  options: DesignerEngineOptions,
  ...otherEngineCreators: EngineCreator<any, any>[]
) =>
  combineEngineCreators<DesignerState, any>(
    createDesignerEngine(options),
    createHistoryEngine,
    createShortcutEngine,
    ...otherEngineCreators
  );
