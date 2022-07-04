import {
  fork,
  select,
  take,
  call,
  put,
  spawn as spawn2,
  throttle,
} from "redux-saga/effects";
import * as fs from "fs";
import * as chokidar from "chokidar";
import * as fsa from "fs-extra";
import { debounce } from "lodash";
import * as path from "path";
import { ipcSaga } from "./ipc";
import { eventChannel } from "redux-saga";
import { clipboard } from "electron";
import {
  findPaperclipSourceFiles,
  pcSourceFileUrisReceived,
  walkPCRootDirectory,
  createPCModule,
  createPCElement,
  PCVisibleNodeMetadataKey,
} from "@paperclip-lang/core";
import {
  fileChanged,
  FileChanged,
  FILE_CHANGED,
  FileChangedEventType,
} from "fsbox";
import {
  getNestedTreeNodeById,
  addProtocol,
  stripProtocol,
  Directory,
  FILE_PROTOCOL,
  FSItemTagNames,
  flattenTreeNode,
  getFileFromUri,
  EMPTY_ARRAY,
  createBounds,
  normalizeFilePath,
} from "tandem-common";
import { DesktopRootState } from "../state";
import { processSaga } from "./processes";
import { unloadApplication } from "@tandem-ui/designer";
import { exec } from "child_process";

export function* rootSaga() {
  yield fork(ipcSaga);
  yield fork(handleSaveShortcut);
  yield fork(handleNewFileEntered);
  yield fork(handleBasenameChanged);
  yield fork(handleDroppedFile);
  yield fork(handleProjectDirectory);
  yield fork(watchProjectDirectory);
  yield fork(handleQuickSearch);
  yield fork(chromeSaga);
  yield fork(processSaga);
  yield fork(handleOpenLink);
  yield fork(handleClipboard);
}
function* handleOpenLink() {
  while (1) {
    const { url }: LinkClicked = yield take(LINK_CICKED);
    exec(`open ${url}`);
  }
}

function* handleClipboard() {
  yield fork(function* handleCopy() {
    while (1) {
      yield take(INSPECTOR_NODE_CONTEXT_MENU_COPY_CLICKED);
      clipboard.writeText(
        JSON.stringify(getInspectorNodeClipboardData(yield select())),
        "text/plain" as any
      );
    }
  });

  yield fork(function* handlePaste() {
    while (1) {
      yield take(INSPECTOR_NODE_CONTEXT_MENU_PASTE_CLICKED);
      const text = clipboard.readText("text/plain" as any);
      yield put(inspectorNodePasted(JSON.parse(text)));
    }
  });
}
function* handleProjectDirectory() {
  let previousInfo: ProjectInfo;
  while (1) {
    yield take(PROJECT_INFO_LOADED);
    const state: RootState = yield select();

    // skip if there are no changes to the config
    if (
      previousInfo &&
      state.projectInfo.path === previousInfo.path &&
      state.projectInfo.config.rootDir === previousInfo.config.rootDir
    ) {
      continue;
    }
    previousInfo = state.projectInfo;
    yield call(loadPCFiles);
  }
}

function* loadPCFiles() {
  const { projectInfo }: DesktopRootState = yield select();
  if (!projectInfo || !projectInfo.config) {
    return;
  }

  const sourceFiles = findPaperclipSourceFiles(
    projectInfo.config,
    stripProtocol(path.dirname(projectInfo.path))
  ).map((path) => addProtocol(FILE_PROTOCOL, path));
  yield put(pcSourceFileUrisReceived(sourceFiles));
}

function* handleBasenameChanged() {
  while (1) {
    const { basename, item }: FileNavigatorBasenameChanged = yield take(
      FILE_NAVIGATOR_BASENAME_CHANGED
    );
    const filePath = stripProtocol(item.uri);
    const newFilePath = path.join(path.dirname(filePath), basename);

    // TODO - this needs to be a prompt
    if (fsa.existsSync(newFilePath)) {
      console.error(
        `Cannot rename file to ${basename} since the file already exists.`
      );
      continue;
    }

    fsa.renameSync(filePath, newFilePath);
  }
}

function* handleNewFileEntered() {
  while (1) {
    const { basename, directoryId, insertType }: FileNavigatorNewFileEntered =
      yield take(FILE_NAVIGATOR_NEW_FILE_ENTERED);
    const { projectDirectory }: RootState = yield select();
    const directory: Directory = getNestedTreeNodeById(
      directoryId,
      projectDirectory
    );
    const uri = directory.uri;
    const filePath = path.join(stripProtocol(uri), basename);

    if (fs.existsSync(filePath)) {
      continue;
    }

    if (insertType === FSItemTagNames.FILE) {
      fs.writeFileSync(filePath, generateBlankFileContent(basename));
    } else {
      fs.mkdirSync(filePath);
    }

    yield put(newFileAdded(addProtocol(FILE_PROTOCOL, filePath), insertType));
  }
}

const generateBlankFileContent = (basename: string) => {
  if (/\.pc$/.test(basename)) {
    return JSON.stringify(
      createPCModule([
        createPCElement("div", {}, {}, EMPTY_ARRAY, "Frame", {
          [PCVisibleNodeMetadataKey.BOUNDS]: createBounds(0, 600, 0, 400),
        }),
      ]),
      null,
      2
    );
  }
  return "";
};

function* handleDroppedFile() {
  while (1) {
    const { node, targetNode, offset } = yield take(
      FILE_NAVIGATOR_DROPPED_ITEM
    );
    const root: RootState = yield select();
    const newNode = getNestedTreeNodeById(node.id, root.projectDirectory);
    const newUri = newNode.uri;
    const oldUri = node.uri;
    fsa.moveSync(stripProtocol(oldUri), stripProtocol(newUri));
  }
}

function* handleSaveShortcut() {
  while (1) {
    yield take(SHORTCUT_SAVE_KEY_DOWN);
    yield call(saveChanges);
  }
}

function* saveChanges() {
  const state: RootState = yield select();
  const activeEditor = getActiveEditorWindow(state);
  for (const openFile of state.openFiles) {
    if (openFile.newContent) {
      yield call(saveFile, openFile.uri, openFile.newContent);
      yield put(savedFile(openFile.uri));
    }
  }
}

const saveFile = (uri: string, content: Buffer) => {
  return new Promise((resolve, reject) => {
    fs.writeFile(stripProtocol(uri), content, (err) => {
      if (err) {
        return reject(err);
      }
      resolve(null);
    });
  });
};

function* watchProjectDirectory() {
  let watcher;
  let watching: string[] = [];

  yield fork(function* startWatcher() {
    const chan = eventChannel((emit) => {
      watcher = chokidar.watch([], {
        depth: 0,
        ignoreInitial: true,
        persistent: true,
      });

      let actions: FileChanged[] = [];

      // batch to prevent flickering
      const batch = debounce(() => {
        const _actions = actions;
        actions = [];
        _actions.forEach(emit);
      }, 10);
      watcher.on("all", (event, path) => {
        path = normalizeFilePath(path);
        if (/\.DS_Store/.test(path)) {
          return;
        }
        actions.push(fileChanged(event, addProtocol(FILE_PROTOCOL, path)));
        batch();
      });
      return () => {
        watcher.close();
      };
    });
    while (1) {
      const action: FileChanged = yield take(chan);
      const { projectDirectory }: RootState = yield select();
      const dirUri = path.dirname(action.uri);

      const assocDir = getFileFromUri(dirUri, projectDirectory) as Directory;

      // if dir does not exist, then is not expanded. chokidar has an issue
      // where it recursively adds directories, so _not_ doing this can clobber
      // the entire process if something like node_modules is present.
      // Can probably be fixed another way, but this works for now.
      if (!assocDir || !assocDir.expanded) {
        continue;
      }
      yield put(action);
    }
  });

  yield fork(function* handleDirsLoaded() {
    while (1) {
      yield take(PROJECT_DIRECTORY_DIR_LOADED);
      const { projectDirectory }: RootState = yield select();
      const expandedFilePaths = flattenTreeNode(projectDirectory)
        .map((item) => stripProtocol(item.uri))
        .filter((uri) => {
          return watching.indexOf(uri) === -1;
        });
      watching.push(...expandedFilePaths);
      watcher.add(expandedFilePaths);
    }
  });

  yield fork(function* handleChangedFiles() {
    while (1) {
      const { eventType, uri }: FileChanged = yield take(FILE_CHANGED);
      const filePath = stripProtocol(uri);
      switch (eventType) {
        case FileChangedEventType.ADD_DIR:
        case FileChangedEventType.ADD: {
          if (watching.indexOf(filePath) === -1) {
            watching.push(filePath);
            watcher.add(filePath);
          }
          break;
        }
        case FileChangedEventType.UNLINK_DIR:
        case FileChangedEventType.UNLINK: {
          const i = watching.indexOf(filePath);
          if (i !== -1) {
            watching.splice(i, 1);
          }
          break;
        }
      }
    }
  });
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}

function* handleQuickSearch() {
  yield throttle(10, QUICK_SEARCH_FILTER_CHANGED, function* () {
    const { quickSearch, projectInfo }: RootState = yield select();
    if (!projectInfo) {
      return;
    }
    if (!quickSearch.filter) {
      return;
    }

    const pattern = new RegExp(
      escapeRegExp(quickSearch.filter).split(" ").join(".*?"),
      "i"
    );

    const projectDir = path.dirname(projectInfo.path);

    let results: QuickSearchUriResult[] = [];

    walkPCRootDirectory(
      projectInfo.config,
      projectDir,
      (filePath, isDirectory) => {
        if (!isDirectory && pattern.test(filePath)) {
          results.push({
            uri: addProtocol(FILE_PROTOCOL, filePath),
            label: path.basename(filePath),
            description: path.dirname(filePath),
            type: QuickSearchResultType.URI,
          });
        }
      }
    );
    yield put(quickSearchFilterResultLoaded(results.slice(0, 50)));
  });
}

function* chromeSaga() {
  yield fork(function* handleHeaderClick() {
    while (1) {
      yield take(CHROME_HEADER_MOUSE_DOWN);
    }
  });

  // yield fork(function* handleMinimizeClick() {
  //   while (1) {
  //     yield take(CHROME_MINIMIZE_BUTTON_CLICKED);
  //     remote.BrowserWindow.getFocusedWindow().minimize();
  //   }
  // });

  // yield fork(function* handleMaximizeClick() {
  //   while (1) {
  //     yield take(CHROME_MAXIMIZE_BUTTON_CLICKED);
  //     remote.BrowserWindow.getFocusedWindow().setFullScreen(
  //       !remote.BrowserWindow.getFocusedWindow().isFullScreen()
  //     );
  //   }
  // });

  yield fork(function* handleConfirmClose() {
    while (1) {
      const { save, cancel, closeWithoutSaving }: ConfirmCloseWindow =
        yield take(CONFIRM_CLOSE_WINDOW);
      if (cancel) {
        continue;
      }
      if (save) {
        yield call(saveChanges);
      }

      if (save || closeWithoutSaving) {
        yield call(unloadApplication, function* () {
          window.close();
        });
      }
    }
  });
}
