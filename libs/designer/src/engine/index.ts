import {
  combineEngineCreators,
  Dispatch,
  EngineCreator,
} from "@paperclip-ui/common";
import { DesignerState } from "../state";
import { createDesignerEngine } from "../domains/api/engine";
import { createHistoryEngine } from "../domains/history/engine";
import { createKeyboardEngine } from "../domains/keyboard/engine";
import { History } from "../domains/history/history";
import { createShortcutsEngine } from "../domains/shortcuts/engine";
import { createUIEngine } from "../domains/ui/engine";
import { createLogEngine } from "../domains/log/engine";
import { createClipboardEngine } from "../domains/clipboard/engine";
import { DesignerEvent } from "../events";
import { createClient, CreateClientOptions } from "../api";

export type EngineOptions = {
  history: History;
} & CreateClientOptions;

export const createEngine =
  (options: EngineOptions, ...otherEngineCreators: EngineCreator<any, any>[]) =>
  (dispatch: Dispatch<DesignerEvent>, getState: () => DesignerState) => {
    const apiClient = createClient(options, dispatch);

    return combineEngineCreators<DesignerState, any>(
      createDesignerEngine(apiClient),
      createShortcutsEngine(apiClient),
      createClipboardEngine,
      createHistoryEngine(options.history),
      createKeyboardEngine,
      createUIEngine(options.history),
      createLogEngine,
      ...otherEngineCreators
    )(dispatch, getState);
  };
