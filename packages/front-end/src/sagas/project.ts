import { fork, put, call, take, select, takeEvery } from "redux-saga/effects";
import * as path from "path";
import {
  FILE_NAVIGATOR_ITEM_CLICKED,
  FileNavigatorItemClicked,
  TD_PROJECT_LOADED,
  projectInfoLoaded,
  PROJECT_INFO_LOADED,
  projectDirectoryDirLoaded,
  FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED,
  activeEditorUriDirsLoaded,
  FILE_ITEM_CONTEXT_MENU_DELETE_CLICKED,
  FileItemContextMenuAction
} from "../actions";
import {
  addProtocol,
  FILE_PROTOCOL,
  FSItem,
  FSItemTagNames,
  getFileFromUri,
  stripProtocol
} from "tandem-common";
import { ProjectConfig, ProjectInfo, RootState } from "../state";

export type ProjectSagaOptions = {
  loadProjectInfo(): IterableIterator<ProjectInfo>;
  readDirectory(path: string): IterableIterator<FSItem>;
  deleteFile(path: string): IterableIterator<any>;
};

export function projectSaga({
  loadProjectInfo,
  readDirectory,
  deleteFile
}: ProjectSagaOptions) {
  return function*() {
    yield fork(init);
    yield fork(handleProjectLoaded);
    yield fork(handleProjectInfoLoaded);
    yield fork(handleFileNavigatorItemClick);
    yield fork(handleActiveFileUri);
    yield fork(handleFileItemContextMenuDeleted);
  };

  function* init() {
    yield put(projectInfoLoaded(yield call(loadProjectInfo)));
  }

  function* handleProjectLoaded() {
    while (1) {
      yield take(TD_PROJECT_LOADED);
      yield call(init);
    }
  }

  function* handleFileItemContextMenuDeleted() {
    yield takeEvery(FILE_ITEM_CONTEXT_MENU_DELETE_CLICKED, function*({
      item
    }: FileItemContextMenuAction) {
      if (!confirm("Are you sure you want to delete this file?")) {
        return;
      }

      yield call(deleteFile, item.uri);
    });
  }

  function* handleProjectInfoLoaded() {
    let previousProjectPath: string;
    while (1) {
      yield take(PROJECT_INFO_LOADED);
      const { projectInfo }: RootState = yield select();

      // may not have loaded if tandem was opened without pointing to project
      if (!projectInfo || !projectInfo.config) {
        continue;
      }

      // don't do unnecessary work. Project may be reloaded if the config
      // changed locally.
      if (previousProjectPath === projectInfo.path) {
        continue;
      }

      previousProjectPath = projectInfo.path;

      yield call(loadDirectory, path.dirname(projectInfo.path));
    }
  }

  function* handleActiveFileUri() {
    let prevUri: string;
    while (1) {
      yield take();
      const { activeEditorFilePath }: RootState = yield select();
      if (prevUri == activeEditorFilePath || !activeEditorFilePath) {
        continue;
      }
      prevUri = activeEditorFilePath;
      yield call(loadDirectory, path.dirname(activeEditorFilePath));
      yield put(activeEditorUriDirsLoaded());
    }
  }

  function* loadDirectory(dir: string) {
    const { projectInfo, projectDirectory }: RootState = yield select();
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

      const items = yield call(readDirectory, subdirUri);
      yield put(projectDirectoryDirLoaded(items));
    }
  }

  function* handleFileNavigatorItemClick() {
    while (1) {
      const { node, type }: FileNavigatorItemClicked = yield take([
        FILE_NAVIGATOR_TOGGLE_DIRECTORY_CLICKED,
        FILE_NAVIGATOR_ITEM_CLICKED
      ]);
      if (node.name !== FSItemTagNames.DIRECTORY) {
        continue;
      }
      yield call(loadDirectory, node.uri);
    }
  }
}
