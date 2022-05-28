import { createRootInspectorNode } from "paperclip";
import { Action } from "redux";
import { getFileFromUri, mergeFSItems } from "tandem-common";
import {
  ACTIVE_EDITOR_URI_DIRS_LOADED,
  ProjectDirectoryDirLoaded,
  ProjectInfoLoaded,
  PROJECT_DIRECTORY_DIR_LOADED,
  PROJECT_INFO_LOADED,
} from "../../actions";
import {
  getBuildScriptProcess,
  removeBuildScriptProcess,
  RootReadyType,
  RootState,
  setRootStateFileNodeExpanded,
  updateRootState,
} from "../../state";

export const projectReducer = (state: RootState, action: Action): RootState => {
  switch (action.type) {
    case PROJECT_DIRECTORY_DIR_LOADED: {
      const { items } = action as ProjectDirectoryDirLoaded;
      const { projectDirectory } = state;
      state = updateRootState(
        {
          projectDirectory: projectDirectory
            ? mergeFSItems(projectDirectory, ...items)
            : mergeFSItems(...items),
        },
        state
      );

      return state;
    }

    case ACTIVE_EDITOR_URI_DIRS_LOADED: {
      state = setRootStateFileNodeExpanded(
        getFileFromUri(state.activeEditorFilePath, state.projectDirectory).id,
        true,
        state
      );
      return state;
    }

    case PROJECT_INFO_LOADED: {
      const { info: projectInfo } = action as ProjectInfoLoaded;

      // check if there's just a simple config change. If so, then just change config info
      if (
        state.projectInfo &&
        state.projectInfo.path === projectInfo.path &&
        state.projectInfo.config.globalFilePath ===
          projectInfo.config.globalFilePath &&
        state.projectInfo.config.mainFilePath ===
          projectInfo.config.mainFilePath &&
        state.projectInfo.config.rootDir === state.projectInfo.config.rootDir
      ) {
        state = updateRootState(
          {
            projectInfo,
          },
          state
        );
      } else {
        state = updateRootState(
          {
            projectInfo,
            readyType: RootReadyType.LOADED,
            openFiles: [],
            fileCache: {},
            openedMain: false,
            sourceNodeInspector: createRootInspectorNode(),
            projectDirectory: null,
            graph: {},
            documents: [],
            frames: [],
            editorWindows: [],
          },
          state
        );
      }
      const buildProcess = getBuildScriptProcess(state);

      if (buildProcess) {
        if (
          buildProcess.script !==
          (state.projectInfo.config.scripts &&
            state.projectInfo.config.scripts.build)
        ) {
          state = removeBuildScriptProcess(state);
        }
      }

      return state;
    }
  }
  return state;
};
