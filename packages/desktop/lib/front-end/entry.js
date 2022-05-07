"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
Object.defineProperty(exports, "__esModule", { value: true });
var fs = require("fs");
var fsa = require("fs-extra");
var fixPath = require("fix-path");
// fix path for electron so that child processes can be executed like NPM
fixPath();
// const fontManager = require("font-manager");
var sagas_1 = require("./sagas");
var effects_1 = require("redux-saga/effects");
var reducers_1 = require("./reducers");
var electron_1 = require("electron");
var mime = require("mime-types");
var tandem_front_end_1 = require("tandem-front-end");
var tandem_common_1 = require("tandem-common");
var path = require("path");
var Url = require("url");
var child_process_1 = require("child_process");
var paperclip_1 = require("paperclip");
var redux_saga_1 = require("redux-saga");
var browser_1 = require("@sentry/browser");
var pkg = require("../../package.json");
(0, browser_1.init)({
    dsn: "https://a2621f1c757749a895ba5ad69be5ac76@sentry.io/1331704",
    release: pkg.version
});
var query = Url.parse(String(location), true).query;
var init = (0, tandem_front_end_1.setup)(function () {
    return __generator(this, function (_a) {
        return [2 /*return*/, {
                readFile: readFile,
                writeFile: writeFile,
                openPreview: openPreview,
                loadProjectInfo: loadProjectInfo,
                readDirectory: readDirectory,
                openContextMenu: openContextMenu,
                deleteFile: deleteFile,
                openFile: openFile
            }];
    });
}, reducers_1.rootReducer, sagas_1.rootSaga);
var openFile = function (options) {
    return new Promise(function (resolve) {
        electron_1.ipcRenderer.once("openDialogResult", function (event, filePath) {
            resolve(filePath);
        });
        electron_1.ipcRenderer.send("openDialog", options);
    });
};
document.body.addEventListener("click", function (event) {
    if (event.target.tagName === "A" ||
        event.target.parentElement.tagName === "A") {
        event.preventDefault();
        var href = event.target.href ||
            event.target.parentElement.href;
        (0, child_process_1.exec)("open ".concat(href));
    }
});
// give some time so that the loader shows up.
setTimeout(init, 500, {
    mount: document.getElementById("application"),
    selectedInspectorNodes: [],
    hoveringInspectorNodes: [],
    editMode: tandem_front_end_1.EditMode.PRIMARY,
    customChrome: Boolean(query.customChrome),
    selectedFileNodeIds: [],
    readyType: tandem_front_end_1.RootReadyType.LOADING,
    unloaders: [],
    sourceNodeInspector: (0, tandem_front_end_1.createRootInspectorNode)(),
    sourceNodeInspectorMap: {},
    scriptProcesses: [],
    editorWindows: [],
    frames: [],
    documents: [],
    fontFamilies: getFontFamiles(),
    graph: {},
    history: {
        index: 0,
        items: []
    },
    openFiles: [],
    fileCache: {},
    selectedComponentId: null
});
function openPreview(frame) {
    var state, sourceNode, dep;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!query.previewHost) {
                    return [2 /*return*/, false];
                }
                return [4 /*yield*/, (0, effects_1.select)()];
            case 1:
                state = _a.sent();
                sourceNode = (0, paperclip_1.getSyntheticSourceNode)((0, paperclip_1.getSyntheticNodeById)(frame.syntheticContentNodeId, state.documents), state.graph);
                dep = (0, paperclip_1.getPCNodeDependency)(sourceNode.id, state.graph);
                (0, child_process_1.exec)("open http://".concat(query.previewHost, "/preview.html?contentNodeId=").concat(sourceNode.id, "\\&entryPath=").concat(encodeURIComponent((0, tandem_common_1.stripProtocol)(dep.uri))));
                return [2 /*return*/, true];
        }
    });
}
function loadProjectInfo() {
    var chan;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                chan = (0, redux_saga_1.eventChannel)(function (emit) {
                    electron_1.ipcRenderer.once("projectInfo", function (event, arg) { return emit({ ret: arg }); });
                    return function () { };
                });
                electron_1.ipcRenderer.send("getProjectInfo");
                return [4 /*yield*/, (0, effects_1.take)(chan)];
            case 1: return [2 /*return*/, (_a.sent()).ret];
        }
    });
}
function readDirectory(dirUri) {
    var dir, dirBasenames;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                dir = (0, tandem_common_1.stripProtocol)(dirUri);
                return [4 /*yield*/, (0, effects_1.call)(function () {
                        return new Promise(function (resolve) {
                            fs.readdir(dir, function (err, basenames) { return resolve(basenames); });
                        });
                    })];
            case 1:
                dirBasenames = (_a.sent()).filter(function (basename) { return basename !== ".DS_Store"; });
                return [2 /*return*/, dirBasenames.map(function (basename) {
                        var fullPath = (0, tandem_common_1.normalizeFilePath)(path.join(dir, basename));
                        var uri = (0, tandem_common_1.addProtocol)(tandem_common_1.FILE_PROTOCOL, fullPath);
                        if (fs.lstatSync(fullPath).isDirectory()) {
                            return (0, tandem_common_1.createDirectory)(uri);
                        }
                        else {
                            return (0, tandem_common_1.createFile)(uri);
                        }
                    })];
        }
    });
}
function openContextMenu(point, options) {
    return __generator(this, function (_a) {
        electron_1.ipcRenderer.send("openContextMenu", {
            point: point,
            options: options
        });
        return [2 /*return*/];
    });
}
function deleteFile(uri) {
    var path;
    return __generator(this, function (_a) {
        path = (0, tandem_common_1.stripProtocol)(uri);
        fsa.removeSync(path);
        return [2 /*return*/];
    });
}
function getFontFamiles() {
    var used = {};
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
        content: fs.readFileSync((0, tandem_common_1.stripProtocol)(uri)),
        mimeType: mime.lookup(uri) || null
    });
}
function writeFile(uri, content) {
    return __awaiter(this, void 0, void 0, function () {
        return __generator(this, function (_a) {
            fs.writeFileSync(uri, content);
            return [2 /*return*/, true];
        });
    });
}
//# sourceMappingURL=entry.js.map