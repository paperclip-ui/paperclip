import { ProjectEngineOptions, startProjectEngine } from "./project";
import { engineReduxMiddleware } from "tandem-common";
import { startFSBoxEngine } from "fsbox";
import { FSSandboxEngineOptions } from "fsbox/src/base";
import { startPaperclipTandemEngine } from "./paperclip";

export type FrontEndEngineOptions = ProjectEngineOptions &
  FSSandboxEngineOptions;

export const reduxMiddleware = (options: FrontEndEngineOptions) =>
  engineReduxMiddleware([
    startProjectEngine(options),
    startPaperclipTandemEngine(),
    startFSBoxEngine(options),
  ]);
