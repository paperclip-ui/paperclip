"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
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
exports.rootSaga = void 0;
var effects_1 = require("redux-saga/effects");
var chokidar = require("chokidar");
var electron_1 = require("./electron");
var electron_2 = require("electron");
var actions_1 = require("../actions");
var constants_1 = require("../constants");
var ipc_1 = require("./ipc");
var getPort = require("get-port");
var qs = require("querystring");
var child_process_1 = require("child_process");
var paperclip_1 = require("paperclip");
var tandem_common_1 = require("tandem-common");
var menu_1 = require("./menu");
var fs = require("fs");
var fsa = require("fs-extra");
var path = require("path");
var redux_saga_1 = require("redux-saga");
var DEFAULT_TD_PROJECT = {
    scripts: {},
    rootDir: ".",
    exclude: ["node_modules"],
    mainFilePath: "./src/main.pc"
};
var createDefaultTDProjectFiles = function () {
    var _a;
    return ({
        "./src/main.pc": JSON.stringify(paperclip_1.createPCModule([
            paperclip_1.createPCComponent("Application", null, null, null, [paperclip_1.createPCTextNode("App content")], (_a = {},
                _a[paperclip_1.PCVisibleNodeMetadataKey.BOUNDS] = tandem_common_1.createBounds(0, 600, 0, 400),
                _a))
        ]), null, 2)
    });
};
var DEFAULT_TD_PROJECT_NAME = "app.tdproject";
function rootSaga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: 
            // yield fork(watchProjectDirectory);
            return [4 /*yield*/, effects_1.fork(openMainWindow)];
            case 1:
                // yield fork(watchProjectDirectory);
                _a.sent();
                return [4 /*yield*/, effects_1.fork(electron_1.electronSaga)];
            case 2:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(ipc_1.ipcSaga)];
            case 3:
                _a.sent();
                // yield fork(handleLoadProject);
                return [4 /*yield*/, effects_1.fork(menu_1.shortcutsSaga)];
            case 4:
                // yield fork(handleLoadProject);
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleBrowseDirectory)];
            case 5:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(previewServer)];
            case 6:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleOpenProject)];
            case 7:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleCreateProject)];
            case 8:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(initProjectDirectory)];
            case 9:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleOpenedWorkspaceDirectory)];
            case 10:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleAddControllerClick)];
            case 11:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleBrowseImage)];
            case 12:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleChrome)];
            case 13:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleOpenedLocalFile)];
            case 14:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(watchProjectFilePath)];
            case 15:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
exports.rootSaga = rootSaga;
function initProjectDirectory() {
    var state;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.select()];
            case 1:
                state = _a.sent();
                if (!state.tdProjectPath) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, effects_1.call(loadTDConfig)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function loadTDConfig() {
    var state, project;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.select()];
            case 1:
                state = _a.sent();
                if (!fs.existsSync(state.tdProjectPath)) {
                    console.warn("Tandem config file not found");
                    return [2 /*return*/];
                }
                project = JSON.parse(fs.readFileSync(state.tdProjectPath, "utf8"));
                // TODO - validate config here
                return [4 /*yield*/, effects_1.put(actions_1.tdProjectLoaded(project, state.tdProjectPath))];
            case 2:
                // TODO - validate config here
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function watchProjectFilePath() {
    var channel, _loop_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                _loop_1 = function () {
                    var state;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0: return [4 /*yield*/, effects_1.take(actions_1.TD_PROJECT_LOADED)];
                            case 1:
                                _a.sent();
                                return [4 /*yield*/, effects_1.select()];
                            case 2:
                                state = _a.sent();
                                if (!state.tdProject) {
                                    return [2 /*return*/, "continue"];
                                }
                                if (channel) {
                                    channel.close();
                                }
                                channel = redux_saga_1.eventChannel(function (emit) {
                                    var watcher = chokidar.watch(state.tdProjectPath);
                                    watcher.on("change", function (event, path) {
                                        emit({ type: event });
                                    });
                                    return function () {
                                        watcher.close();
                                    };
                                });
                                return [4 /*yield*/, effects_1.fork(function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, effects_1.take(channel)];
                                                case 1:
                                                    _a.sent();
                                                    return [4 /*yield*/, effects_1.call(loadTDConfig)];
                                                case 2:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    })];
                            case 3:
                                _a.sent();
                                return [2 /*return*/];
                        }
                    });
                };
                _a.label = 1;
            case 1:
                if (!1) return [3 /*break*/, 3];
                return [5 /*yield**/, _loop_1()];
            case 2:
                _a.sent();
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/];
        }
    });
}
function openMainWindow() {
    var state, withFrame, mainWindow, url, query;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.take(actions_1.APP_READY)];
            case 1:
                _a.sent();
                return [4 /*yield*/, effects_1.select()];
            case 2:
                state = _a.sent();
                withFrame = false;
                mainWindow = new electron_2.BrowserWindow({
                    width: 900,
                    height: 600,
                    titleBarStyle: "hidden"
                });
                mainWindow.webContents.on;
                url = constants_1.FRONT_END_ENTRY_FILE_PATH;
                query = {
                // react_perf: true
                };
                if (state.info.previewServer) {
                    query.previewHost = "localhost:" + state.info.previewServer.port;
                }
                if (!withFrame) {
                    query.customChrome = true;
                }
                mainWindow.loadURL(url + (Object.keys(query).length ? "?" + qs.stringify(query) : ""));
                return [4 /*yield*/, effects_1.fork(function () {
                        var message;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!1) return [3 /*break*/, 2];
                                    return [4 /*yield*/, effects_1.take()];
                                case 1:
                                    message = _a.sent();
                                    if (tandem_common_1.isPublicAction(message) && !message["@@" + ipc_1.pid]) {
                                        mainWindow.webContents.send("message", message);
                                    }
                                    return [3 /*break*/, 0];
                                case 2: return [2 /*return*/];
                            }
                        });
                    })];
            case 3:
                _a.sent();
                // Fixes https://github.com/tandemcode/tandem/issues/492
                mainWindow.once("close", function () {
                    process.exit();
                });
                return [4 /*yield*/, effects_1.put(actions_1.mainWindowOpened())];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function previewServer() {
    var state, port, _a, bin, args, proc;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, effects_1.take(actions_1.TD_PROJECT_LOADED)];
            case 1:
                _b.sent();
                return [4 /*yield*/, effects_1.select()];
            case 2:
                state = _b.sent();
                if (!state.tdProject ||
                    !state.tdProject.scripts ||
                    !state.tdProject.scripts.previewServer) {
                    return [2 /*return*/];
                }
                return [4 /*yield*/, effects_1.call(getPort)];
            case 3:
                port = _b.sent();
                _a = state.tdProject.scripts.previewServer.split(" "), bin = _a[0], args = _a.slice(1);
                proc = child_process_1.spawn(bin, args, {
                    cwd: path.dirname(state.tdProjectPath),
                    env: __assign(__assign({}, process.env), { ELECTRON_RUN_AS_NODE: true, PORT: port })
                });
                proc.stderr.pipe(process.stderr);
                proc.stdout.pipe(process.stdout);
                return [4 /*yield*/, effects_1.put(actions_1.previewServerStarted(port))];
            case 4:
                _b.sent();
                return [2 /*return*/];
        }
    });
}
function handleOpenedLocalFile() {
    var chan, _a, _b;
    return __generator(this, function (_c) {
        switch (_c.label) {
            case 0:
                chan = redux_saga_1.eventChannel(function (emit) {
                    electron_2.app.on("open-file", function (event, path) {
                        emit(path);
                    });
                    return function () { };
                });
                _c.label = 1;
            case 1:
                if (!1) return [3 /*break*/, 4];
                _a = effects_1.put;
                _b = actions_1.localFileOpened;
                return [4 /*yield*/, effects_1.take(chan)];
            case 2: return [4 /*yield*/, _a.apply(void 0, [_b.apply(void 0, [_c.sent()])])];
            case 3:
                _c.sent();
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
function handleOpenProject() {
    var filePath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, effects_1.take([actions_1.OPEN_PROJECT_MENU_ITEM_CLICKED, "OPEN_PROJECT_BUTTON_CLICKED"])];
            case 1:
                _a.sent();
                filePath = (electron_2.dialog.showOpenDialog({
                    filters: [
                        {
                            name: "Tandem Project File",
                            extensions: ["tdproject"]
                        }
                    ],
                    properties: ["openFile"]
                }) || [undefined])[0];
                if (!filePath) {
                    return [3 /*break*/, 0];
                }
                return [4 /*yield*/, effects_1.put(actions_1.tdProjectFilePicked(tandem_common_1.normalizeFilePath(filePath)))];
            case 2:
                _a.sent();
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
function handleCreateProject() {
    var _a, directory, projectFiles, filePath, parFiles, files, relativePath, fullPath;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, effects_1.take([
                        "CREATE_PROJECT_BUTTON_CLICKED",
                        actions_1.NEW_PROJECT_MENU_ITEM_CLICKED
                    ])];
            case 1:
                _a = _b.sent(), directory = _a.directory, projectFiles = _a.files;
                filePath = path.join(directory, DEFAULT_TD_PROJECT_NAME);
                if (!fs.existsSync(filePath)) {
                    parFiles = projectFiles
                        ? projectFiles
                        : createDefaultTDProjectFiles();
                    files = parFiles["app.tdproject"]
                        ? parFiles
                        : __assign(__assign({}, parFiles), { "app.tdproject": JSON.stringify(DEFAULT_TD_PROJECT, null, 2) });
                    for (relativePath in files) {
                        fullPath = path.join(directory, relativePath);
                        try {
                            fsa.mkdirpSync(path.dirname(fullPath));
                        }
                        catch (e) { }
                        fs.writeFileSync(fullPath, files[relativePath], "utf8");
                    }
                }
                return [4 /*yield*/, effects_1.put(actions_1.tdProjectFilePicked(filePath))];
            case 2:
                _b.sent();
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
function handleChrome() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.fork(function handleCloseClick() {
                    var _a, unsaved, origin_1, sender, option;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0:
                                if (!1) return [3 /*break*/, 5];
                                return [4 /*yield*/, effects_1.take("CHROME_CLOSE_BUTTON_CLICKED")];
                            case 1:
                                _a = _b.sent(), unsaved = _a.unsaved, origin_1 = _a.origin;
                                sender = origin_1.sender;
                                if (!!unsaved) return [3 /*break*/, 3];
                                return [4 /*yield*/, effects_1.put({
                                        type: "CONFIRM_CLOSE_WINDOW",
                                        "@@public": true,
                                        closeWithoutSaving: true,
                                        cancel: false,
                                        save: false
                                    })];
                            case 2:
                                _b.sent();
                                return [3 /*break*/, 0];
                            case 3:
                                option = electron_2.dialog.showMessageBox({
                                    message: "Do you want to save changes?",
                                    buttons: ["Save", "Cancel", "Don't save"]
                                });
                                return [4 /*yield*/, effects_1.put({
                                        type: "CONFIRM_CLOSE_WINDOW",
                                        "@@public": true,
                                        closeWithoutSaving: option === 2,
                                        cancel: option === 1,
                                        save: option === 0
                                    })];
                            case 4:
                                _b.sent();
                                return [3 /*break*/, 0];
                            case 5: return [2 /*return*/];
                        }
                    });
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function handleOpenedWorkspaceDirectory() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, effects_1.take([actions_1.TD_PROJECT_FILE_PICKED, actions_1.LOCAL_FILE_LOADED])];
            case 1:
                _a.sent();
                return [4 /*yield*/, effects_1.call(initProjectDirectory)];
            case 2:
                _a.sent();
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
function handleAddControllerClick() {
    var defaultPath, controllerFilePath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, effects_1.take("ADD_COMPONENT_CONTROLLER_BUTTON_CLICKED")];
            case 1:
                defaultPath = (_a.sent()).defaultPath;
                controllerFilePath = (electron_2.dialog.showOpenDialog({
                    defaultPath: defaultPath,
                    properties: ["openFile"]
                }) || [undefined])[0];
                if (!controllerFilePath) {
                    return [3 /*break*/, 0];
                }
                return [4 /*yield*/, effects_1.put(actions_1.componentControllerPicked(tandem_common_1.normalizeFilePath(controllerFilePath)))];
            case 2:
                _a.sent();
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
function handleBrowseImage() {
    var filePath;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, effects_1.take(["IMAGE_BROWSE_BUTTON_CLICKED"])];
            case 1:
                _a.sent();
                filePath = (electron_2.dialog.showOpenDialog({
                    filters: [
                        {
                            name: "Image",
                            extensions: ["png", "jpg", "jpeg", "gif", "apng", "svg", "bmp"]
                        }
                    ],
                    properties: ["openFile"]
                }) || [undefined])[0];
                if (!filePath) {
                    return [3 /*break*/, 0];
                }
                return [4 /*yield*/, effects_1.put(actions_1.imagePathPicked(tandem_common_1.normalizeFilePath(filePath)))];
            case 2:
                _a.sent();
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
function handleBrowseDirectory() {
    var directory;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, effects_1.take(["BROWSE_DIRECTORY_CLICKED"])];
            case 1:
                _a.sent();
                directory = (electron_2.dialog.showOpenDialog({
                    properties: ["openDirectory"]
                }) || [undefined])[0];
                if (!directory) {
                    return [3 /*break*/, 0];
                }
                return [4 /*yield*/, effects_1.put(actions_1.directoryPathPicked(tandem_common_1.normalizeFilePath(directory)))];
            case 2:
                _a.sent();
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
//# sourceMappingURL=index.js.map