import { Action } from "redux";
import { DesktopState, TDProject } from "../state";
import {
  TD_PROJECT_LOADED,
  TDProjectLoaded,
  PREVIEW_SERVER_STARTED,
  PreviewServerStarted,
  TD_PROJECT_FILE_PICKED,
  TDProjectFilePicked,
  LOCAL_FILE_LOADED,
  LocalFileLoaded,
} from "../actions";
import { normalizeFilePath } from "tandem-common";

export const rootReducer = (
  state: DesktopState,
  action: Action
): DesktopState => {
  switch (action.type) {
    case TD_PROJECT_FILE_PICKED: {
      const { filePath } = action as TDProjectFilePicked;
      return { ...state, tdProjectPath: normalizeFilePath(filePath) };
    }
    case LOCAL_FILE_LOADED: {
      const { path } = action as LocalFileLoaded;
      if (/.tdproject/.test(path)) {
        return {
          ...state,
          tdProjectPath: normalizeFilePath(path),
        };
      }
      return state;
    }
    case TD_PROJECT_LOADED: {
      const { project: tdProject } = action as TDProjectLoaded;
      return { ...state, tdProject };
    }
    case PREVIEW_SERVER_STARTED: {
      const { port } = action as PreviewServerStarted;
      return {
        ...state,
        info: {
          ...state.info,
          previewServer: {
            port,
          },
        },
      };
    }
  }
  return state;
};
