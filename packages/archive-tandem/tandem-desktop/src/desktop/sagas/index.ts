import { fork, call, take, select, put } from "redux-saga/effects";
import * as chokidar from "chokidar";
import { electronSaga } from "./electron";
import { BrowserWindow, dialog, app } from "electron";
import {
  APP_READY,
  mainWindowOpened,
  tdProjectLoaded,
  TD_PROJECT_LOADED,
  previewServerStarted,
  OPEN_PROJECT_MENU_ITEM_CLICKED,
  tdProjectFilePicked,
  TD_PROJECT_FILE_PICKED,
  componentControllerPicked,
  NEW_PROJECT_MENU_ITEM_CLICKED,
  imagePathPicked,
  localFileOpened,
  LOCAL_FILE_LOADED,
  directoryPathPicked,
} from "../actions";
import { FRONT_END_ENTRY_FILE_PATH } from "../constants";
import { ipcSaga, pid } from "./ipc";
import * as getPort from "get-port";
import * as qs from "querystring";
import { spawn } from "child_process";
import {
  walkPCRootDirectory,
  createPCModule,
  createPCComponent,
  PCVisibleNodeMetadataKey,
  createPCTextNode,
} from "paperclip";
import { DesktopState, TDProject } from "../state";
import { isPublicAction, createBounds, normalizeFilePath } from "tandem-common";
import { shortcutsSaga } from "./menu";
import * as fs from "fs";
import * as fsa from "fs-extra";
import * as path from "path";
import {
  ConfirmCloseWindow,
  CreateProjectButtonClicked,
} from "@tandem-ui/designer";
import { eventChannel, Channel } from "redux-saga";
import { DesktopRootState } from "../../front-end/state";

const DEFAULT_TD_PROJECT: TDProject = {
  scripts: {},
  rootDir: ".",
  exclude: ["node_modules"],
  mainFilePath: "./src/main.pc",
};

const createDefaultTDProjectFiles = () => ({
  "./src/main.pc": JSON.stringify(
    createPCModule([
      createPCComponent(
        "Application",
        null,
        null,
        null,
        [createPCTextNode("App content")],
        {
          [PCVisibleNodeMetadataKey.BOUNDS]: createBounds(0, 600, 0, 400),
        }
      ),
    ]),
    null,
    2
  ),
});

const DEFAULT_TD_PROJECT_NAME = "app.tdproject";

export function* rootSaga() {
  // yield fork(watchProjectDirectory);
  yield fork(openMainWindow);
  yield fork(electronSaga);
  yield fork(ipcSaga);
  // yield fork(handleLoadProject);
  yield fork(shortcutsSaga);
  yield fork(handleBrowseDirectory);
  yield fork(previewServer);
  yield fork(handleOpenProject);
  yield fork(handleCreateProject);
  yield fork(initProjectDirectory);
  yield fork(handleOpenedWorkspaceDirectory);
  yield fork(handleAddControllerClick);
  yield fork(handleBrowseImage);
  yield fork(handleChrome);
  yield fork(handleOpenedLocalFile);
  yield fork(watchProjectFilePath);
}

function* initProjectDirectory() {
  const state: DesktopState = yield select();
  if (!state.tdProjectPath) {
    return;
  }
  yield call(loadTDConfig);
}

function* loadTDConfig() {
  const state: DesktopState = yield select();
  if (!fs.existsSync(state.tdProjectPath)) {
    console.warn(`Tandem config file not found`);
    return;
  }

  const project = JSON.parse(fs.readFileSync(state.tdProjectPath, "utf8"));

  // TODO - validate config here
  yield put(tdProjectLoaded(project, state.tdProjectPath));
}

function* watchProjectFilePath() {
  let channel: Channel<any>;

  while (1) {
    yield take(TD_PROJECT_LOADED);
    const state: DesktopState = yield select();
    if (!state.tdProject) {
      continue;
    }

    if (channel) {
      channel.close();
    }

    channel = eventChannel((emit) => {
      const watcher = chokidar.watch(state.tdProjectPath);
      watcher.on("change", (event, path) => {
        emit({ type: event });
      });
      return () => {
        watcher.close();
      };
    });

    yield fork(function* () {
      yield take(channel);
      yield call(loadTDConfig);
    });
  }
}

function* openMainWindow() {
  yield take(APP_READY);
  const state: DesktopState = yield select();
  const withFrame = false;
  const mainWindow = new BrowserWindow({
    width: 900,
    height: 600,
    titleBarStyle: "hidden",
    webPreferences: {
      nodeIntegration: true,
      contextIsolation: false,
    },
  });

  mainWindow.webContents.on;

  let url = FRONT_END_ENTRY_FILE_PATH;

  const query: any = {
    // react_perf: true
  };

  if (state.info.previewServer) {
    query.previewHost = `localhost:${state.info.previewServer.port}`;
  }

  if (!withFrame) {
    query.customChrome = true;
  }

  mainWindow.loadURL(
    url + (Object.keys(query).length ? "?" + qs.stringify(query) : "")
  );

  console.log(
    url + (Object.keys(query).length ? "?" + qs.stringify(query) : "")
  );

  yield fork(function* () {
    while (1) {
      const message = yield take();
      if (isPublicAction(message) && !message["@@" + pid]) {
        mainWindow.webContents.send("message", message);
      }
    }
  });

  // Fixes https://github.com/tandemcode/tandem/issues/492
  mainWindow.once("close", () => {
    process.exit();
  });

  yield put(mainWindowOpened());
}

function* previewServer() {
  yield take(TD_PROJECT_LOADED);
  const state: DesktopState = yield select();

  if (
    !state.tdProject ||
    !state.tdProject.scripts ||
    !state.tdProject.scripts.previewServer
  ) {
    return;
  }
  const port = yield call(getPort);
  let [bin, ...args] = state.tdProject.scripts.previewServer.split(" ");
  const proc = spawn(bin, args, {
    cwd: path.dirname(state.tdProjectPath),
    env: {
      ...process.env,
      ELECTRON_RUN_AS_NODE: true,
      PORT: port,
    } as any,
  });
  proc.stderr.pipe(process.stderr);
  proc.stdout.pipe(process.stdout);

  yield put(previewServerStarted(port));
}
function* handleOpenedLocalFile() {
  const chan = eventChannel((emit) => {
    app.on("open-file", (event, path) => {
      emit(path);
    });
    return () => {};
  });

  while (1) {
    yield put(localFileOpened(yield take(chan)));
  }
}

function* handleOpenProject() {
  while (1) {
    yield take([OPEN_PROJECT_MENU_ITEM_CLICKED, "OPEN_PROJECT_BUTTON_CLICKED"]);
    const [filePath] = yield call(dialog.showOpenDialog, {
      filters: [
        {
          name: "Tandem Project File",
          extensions: ["tdproject"],
        },
      ],
      properties: ["openFile"],
    }) || [undefined];
    if (!filePath) {
      continue;
    }

    yield put(tdProjectFilePicked(normalizeFilePath(filePath)));
  }
}

function* handleCreateProject() {
  while (1) {
    const { directory, files: projectFiles }: CreateProjectButtonClicked =
      yield take([
        "CREATE_PROJECT_BUTTON_CLICKED",
        NEW_PROJECT_MENU_ITEM_CLICKED,
      ]);

    const filePath = path.join(directory, DEFAULT_TD_PROJECT_NAME);

    if (!fs.existsSync(filePath)) {
      let parFiles = projectFiles
        ? projectFiles
        : createDefaultTDProjectFiles();

      const files = parFiles["app.tdproject"]
        ? parFiles
        : {
            ...parFiles,
            "app.tdproject": JSON.stringify(DEFAULT_TD_PROJECT, null, 2),
          };

      for (const relativePath in files) {
        const fullPath = path.join(directory, relativePath);
        try {
          fsa.mkdirpSync(path.dirname(fullPath));
        } catch (e) {}
        fs.writeFileSync(fullPath, files[relativePath], "utf8");
      }
    }
    yield put(tdProjectFilePicked(filePath));
  }
}

function* handleChrome() {
  yield fork(function* handleCloseClick() {
    while (1) {
      const { unsaved, origin } = yield take("CHROME_CLOSE_BUTTON_CLICKED");
      const sender: BrowserWindow = origin.sender;
      if (!unsaved) {
        yield put({
          type: "CONFIRM_CLOSE_WINDOW",
          "@@public": true,
          closeWithoutSaving: true,
          cancel: false,
          save: false,
        } as ConfirmCloseWindow);
        continue;
      }

      const option = yield call(dialog.showMessageBox, {
        message: "Do you want to save changes?",
        buttons: ["Save", "Cancel", "Don't save"],
      });
      yield put({
        type: "CONFIRM_CLOSE_WINDOW",
        "@@public": true,
        closeWithoutSaving: option === 2,
        cancel: option === 1,
        save: option === 0,
      } as ConfirmCloseWindow);
    }
  });
}

function* handleOpenedWorkspaceDirectory() {
  while (1) {
    yield take([TD_PROJECT_FILE_PICKED, LOCAL_FILE_LOADED]);
    yield call(initProjectDirectory);
  }
}

function* handleAddControllerClick() {
  while (1) {
    const { defaultPath } = yield take(
      "ADD_COMPONENT_CONTROLLER_BUTTON_CLICKED"
    );
    const [controllerFilePath] = yield call(dialog.showOpenDialog, {
      defaultPath,
      properties: ["openFile"],
    }) || [undefined];
    if (!controllerFilePath) {
      continue;
    }

    yield put(componentControllerPicked(normalizeFilePath(controllerFilePath)));
  }
}

function* handleBrowseImage() {
  while (1) {
    yield take(["IMAGE_BROWSE_BUTTON_CLICKED"]);
    const [filePath] = yield call(dialog.showOpenDialog, {
      filters: [
        {
          name: "Image",
          extensions: ["png", "jpg", "jpeg", "gif", "apng", "svg", "bmp"],
        },
      ],
      properties: ["openFile"],
    }) || [undefined];
    if (!filePath) {
      continue;
    }

    yield put(imagePathPicked(normalizeFilePath(filePath)));
  }
}

function* handleBrowseDirectory() {
  while (1) {
    yield take(["BROWSE_DIRECTORY_CLICKED"]);
    const [directory] = yield call(dialog.showOpenDialog, {
      properties: ["openDirectory"],
    }) || [undefined];
    if (!directory) {
      continue;
    }

    yield put(directoryPathPicked(normalizeFilePath(directory)));
  }
}
