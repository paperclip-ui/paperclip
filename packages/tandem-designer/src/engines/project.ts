import {
  addProtocol,
  FILE_PROTOCOL,
  FSItem,
  FSItemTagNames,
  getFileFromUri,
  stripProtocol,
} from "tandem-common";
import { Action } from "redux";
import { ProjectInfo, RootState } from "../state";
import * as path from "path";
import { Dispatch } from "react";
import {
  activeEditorUriDirsLoaded,
  FileItemContextMenuAction,
  FileNavigatorItemClicked,
  FILE_ITEM_CONTEXT_MENU_COPY_PATH_CLICKED,
  FILE_ITEM_RIGHT_CLICKED,
  FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED,
  projectDirectoryDirLoaded,
  projectInfoLoaded,
  PROJECT_INFO_LOADED,
  TD_PROJECT_LOADED,
} from "../actions";

export type ProjectEngineOptions = {
  readDirectory(path: string): Promise<FSItem[]>;
  deleteFile(path: string);
  loadProjectInfo(): Promise<ProjectInfo>;
};

export const startProjectEngine =
  ({ loadProjectInfo, readDirectory, deleteFile }: ProjectEngineOptions) =>
  (dispatch: Dispatch<any>) => {
    const init = async () => {
      await dispatch(projectInfoLoaded(await loadProjectInfo()));
    };

    const projectLoadedHandler = async (action: Action) => {
      if (action.type === TD_PROJECT_LOADED) {
        await init();
      }
    };

    const loadDirectory = async (dir: string, state: RootState) => {
      const { projectInfo, projectDirectory } = state;
      const projectDir = path.dirname(stripProtocol(projectInfo.path));
      const relativePathParts = stripProtocol(dir)
        .replace(projectDir, "")
        .split(/[\\/]/);
      for (let i = 0, { length } = relativePathParts; i < length; i++) {
        const subdir = path.join(
          projectDir,
          ...relativePathParts.slice(0, i + 1)
        );

        const subdirUri = addProtocol(FILE_PROTOCOL, subdir);

        // files should be watched, so skip any already laoded dirs
        if (
          projectDirectory &&
          getFileFromUri(subdirUri, projectDirectory) &&
          getFileFromUri(subdirUri, projectDirectory).children.length
        ) {
          continue;
        }

        const items = await readDirectory(subdirUri);
        await dispatch(projectDirectoryDirLoaded(items));
      }
    };

    const projectinfoLoadedHandler = async (
      action: Action,
      state: RootState,
      { projectInfo: prevProjectInfo }: RootState
    ) => {
      const { projectInfo } = state;
      if (action.type !== PROJECT_INFO_LOADED) {
        return;
      }

      if (!projectInfo || !projectInfo.config) {
        return;
      }

      if (prevProjectInfo?.path === projectInfo.path) {
        return;
      }

      await loadDirectory(path.dirname(projectInfo.path), state);
    };

    const fileNavigatorClickHandler = async (
      action: Action,
      state: RootState
    ) => {
      if (
        action.type !== FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED &&
        action.type !== FILE_ITEM_RIGHT_CLICKED
      ) {
        return;
      }
      const { node, type } = action as FileNavigatorItemClicked;

      if (node.name === FSItemTagNames.DIRECTORY) {
        return;
      }

      await loadDirectory(node.uri, state);
    };

    const activeFileUriHandler = async (
      state: RootState,
      prevState: RootState
    ) => {
      if (
        state.activeEditorFilePath === prevState.activeEditorFilePath ||
        !state.activeEditorFilePath
      ) {
        return;
      }
      await loadDirectory(state.activeEditorFilePath, state);
      dispatch(activeEditorUriDirsLoaded());
    };

    const fileItemContextMenuItemDeletedHandler = async (action: Action) => {
      if (action.type !== FILE_ITEM_CONTEXT_MENU_COPY_PATH_CLICKED) {
        return;
      }

      // TODO - this needs to be part of the reducer code instead of JS function
      if (!confirm("Are you sure you want to delete this file?")) {
        return;
      }

      await deleteFile((action as FileItemContextMenuAction).item.uri);
    };

    init();

    return (action: Action, state: RootState, prevState: RootState) => {
      projectLoadedHandler(action);
      projectinfoLoadedHandler(action, state, prevState);
      fileNavigatorClickHandler(action, state);
      activeFileUriHandler(state, prevState);
      fileItemContextMenuItemDeletedHandler(action);
    };
  };
