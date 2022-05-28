import { ProjectEngineOptions, startProjectEngine } from "./project";
import { engineReduxMiddleware } from "tandem-common";
import { startFSBoxEngine } from "fsbox";
import { FSSandboxEngineOptions } from "fsbox/src/base";
import { startPaperclipTandemEngine } from "./paperclip";
import { startShortcutsEngine } from "./shortcuts";
import { GLOBAL_MENU } from "../menu";
import { globalsEngine } from "./global";
import { quickSearchEngine, QuickSearchEngineOptions } from "./quick-search";

export type FrontEndEngineOptions = ProjectEngineOptions &
  FSSandboxEngineOptions &
  QuickSearchEngineOptions;

export const reduxMiddleware = (options: FrontEndEngineOptions) =>
  engineReduxMiddleware([
    startProjectEngine(options),
    quickSearchEngine(options),
    startPaperclipTandemEngine(),
    startFSBoxEngine(options),
    startShortcutsEngine(GLOBAL_MENU),
    globalsEngine,
  ]);
