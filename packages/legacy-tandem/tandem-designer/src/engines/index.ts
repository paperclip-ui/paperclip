import { ProjectEngineOptions, startProjectEngine } from "./project";
import { engineReduxMiddleware } from "tandem-common";
import { startFSBoxEngine } from "fsbox";
import { FSSandboxEngineOptions } from "fsbox/src/base";
import { startPaperclipTandemEngine } from "./paperclip";
import { startShortcutsEngine } from "./shortcuts";
import { GLOBAL_MENU } from "../menu";

export type FrontEndEngineOptions = ProjectEngineOptions &
  FSSandboxEngineOptions;

export const reduxMiddleware = (options: FrontEndEngineOptions) =>
  engineReduxMiddleware([
    startProjectEngine(options),
    startPaperclipTandemEngine(),
    startFSBoxEngine(options),
    startShortcutsEngine(GLOBAL_MENU),
  ]);
