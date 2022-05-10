import * as fs from "fs";
import * as fsa from "fs-extra";
const fixPath = require("fix-path");

// fix path for electron so that child processes can be executed like NPM
fixPath();

// const fontManager = require("font-manager");
import { rootSaga } from "./sagas";
import { select, take, call } from "redux-saga/effects";
import { rootReducer } from "./reducers";
import { ipcRenderer } from "electron";
import * as mime from "mime-types";
import {
  setup,
  RootState,
  FontFamily,
  createRootInspectorNode,
  ContextMenuItem,
  EditMode,
  RootReadyType,
} from "tandem-designer";
import {
  stripProtocol,
  createDirectory,
  addProtocol,
  normalizeFilePath,
  FILE_PROTOCOL,
  createFile,
  Point,
} from "tandem-common";
import { DesktopRootState } from "./state";
import * as path from "path";
import * as Url from "url";
import { exec } from "child_process";
import {
  Frame,
  getSyntheticSourceNode,
  getSyntheticNodeById,
  getPCNodeDependency,
} from "paperclip";
import { eventChannel } from "redux-saga";
import { FileOpenerOptions } from "tandem-designer/src/components/contexts";
const pkg = require("../../package.json");

console.log("ENTTT");

// initSentry({
//   dsn: "https://a2621f1c757749a895ba5ad69be5ac76@sentry.io/1331704",
//   release: pkg.version
// });

const query = Url.parse(String(location), true).query;

const init = setup(
  function* () {
    return {
      readFile,
      writeFile,
      openPreview,
      loadProjectInfo,
      readDirectory,
      openContextMenu,
      deleteFile,
      openFile,
    };
  },
  rootReducer,
  rootSaga
);

const openFile = (options: FileOpenerOptions) => {
  return new Promise<string>((resolve) => {
    ipcRenderer.once("openDialogResult", (event, filePath) => {
      resolve(filePath);
    });

    ipcRenderer.send("openDialog", options);
  });
};

document.body.addEventListener("click", (event) => {
  if (
    (event.target as HTMLElement).tagName === "A" ||
    (event.target as HTMLElement).parentElement.tagName === "A"
  ) {
    event.preventDefault();
    const href =
      (event.target as HTMLAnchorElement).href ||
      ((event.target as HTMLAnchorElement).parentElement as any).href;
    exec(`open ${href}`);
  }
});

// give some time so that the loader shows up.
setTimeout(init, 500, {
  mount: document.getElementById("application"),
  selectedInspectorNodes: [],
  hoveringInspectorNodes: [],
  editMode: EditMode.PRIMARY,
  customChrome: Boolean(query.customChrome),
  selectedFileNodeIds: [],
  readyType: RootReadyType.LOADING,
  unloaders: [],
  sourceNodeInspector: createRootInspectorNode(),
  sourceNodeInspectorMap: {},
  scriptProcesses: [],
  editorWindows: [],
  frames: [],
  documents: [],
  fontFamilies: getFontFamiles(),
  graph: {},
  history: {
    index: 0,
    items: [],
  },
  openFiles: [],
  fileCache: {},
  selectedComponentId: null,
} as any);

function* openPreview(frame: Frame) {
  if (!query.previewHost) {
    return false;
  }

  const state: RootState = yield select();

  const sourceNode = getSyntheticSourceNode(
    getSyntheticNodeById(frame.syntheticContentNodeId, state.documents),
    state.graph
  );
  const dep = getPCNodeDependency(sourceNode.id, state.graph);

  exec(
    `open http://${query.previewHost}/preview.html?contentNodeId=${
      sourceNode.id
    }\\&entryPath=${encodeURIComponent(stripProtocol(dep.uri))}`
  );

  return true;
}

function* loadProjectInfo() {
  const chan = eventChannel((emit) => {
    ipcRenderer.once("projectInfo", (event, arg) => emit({ ret: arg }));
    return () => {};
  });
  ipcRenderer.send("getProjectInfo");
  return (yield take(chan)).ret;
}

function* readDirectory(dirUri: string): any {
  const dir = stripProtocol(dirUri);
  const dirBasenames: string[] = (yield call(
    () =>
      new Promise((resolve) => {
        fs.readdir(dir, (err, basenames) => resolve(basenames));
      })
  )).filter((basename) => basename !== ".DS_Store");

  return dirBasenames.map((basename) => {
    const fullPath = normalizeFilePath(path.join(dir, basename));
    const uri = addProtocol(FILE_PROTOCOL, fullPath);
    if (fs.lstatSync(fullPath).isDirectory()) {
      return createDirectory(uri);
    } else {
      return createFile(uri);
    }
  });
}

function* openContextMenu(point: Point, options: ContextMenuItem[]) {
  ipcRenderer.send("openContextMenu", {
    point,
    options,
  });
}

function* deleteFile(uri: string) {
  const path = stripProtocol(uri);
  fsa.removeSync(path);
}

function getFontFamiles(): FontFamily[] {
  let used = {};

  return [];
  // return fontManager
  //   .getAvailableFontsSync()
  //   .map(info => {
  //     return {
  //       name: info.family
  //     };
  //   })
  //   .filter(family => {
  //     if (used[family.name]) return false;
  //     return (used[family.name] = true);
  //   });
}

function readFile(uri) {
  return Promise.resolve({
    content: fs.readFileSync(stripProtocol(uri)),
    mimeType: mime.lookup(uri) || null,
  });
}

async function writeFile(uri: string, content: Buffer) {
  fs.writeFileSync(uri, content);
  return true;
}
