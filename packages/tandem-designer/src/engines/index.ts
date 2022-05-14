import { ProjectEngineOptions } from "./project";

export type FrontEndEngineOptions = ProjectEngineOptions;

export const reduxMiddleware =
  (options: FrontEndEngineOptions) => (store) => (next) => (action) => {
    console.log("OK");
    next(action);
  };
