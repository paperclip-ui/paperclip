"use strict";
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
var fs = require("fs");
var chokidar = require("chokidar");
var fsa = require("fs-extra");
var lodash_1 = require("lodash");
var path = require("path");
var ipc_1 = require("./ipc");
var redux_saga_1 = require("redux-saga");
var electron_1 = require("electron");
var tandem_front_end_1 = require("tandem-front-end");
var paperclip_1 = require("paperclip");
var fsbox_1 = require("fsbox");
var tandem_common_1 = require("tandem-common");
var processes_1 = require("./processes");
var tandem_front_end_2 = require("tandem-front-end");
var child_process_1 = require("child_process");
function rootSaga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, effects_1.fork)(ipc_1.ipcSaga)];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleSaveShortcut)];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleNewFileEntered)];
            case 3:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleBasenameChanged)];
            case 4:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleDroppedFile)];
            case 5:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleProjectDirectory)];
            case 6:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(watchProjectDirectory)];
            case 7:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleQuickSearch)];
            case 8:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(chromeSaga)];
            case 9:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(processes_1.processSaga)];
            case 10:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleOpenLink)];
            case 11:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleClipboard)];
            case 12:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
exports.rootSaga = rootSaga;
function handleOpenLink() {
    var url;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.LINK_CICKED)];
            case 1:
                url = (_a.sent()).url;
                (0, child_process_1.exec)("open ".concat(url));
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
}
function handleClipboard() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, effects_1.fork)(function handleCopy() {
                    var _a, _b, _c, _d, _e;
                    return __generator(this, function (_f) {
                        switch (_f.label) {
                            case 0:
                                if (!1) return [3 /*break*/, 3];
                                return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.INSPECTOR_NODE_CONTEXT_MENU_COPY_CLICKED)];
                            case 1:
                                _f.sent();
                                _b = (_a = electron_1.clipboard).writeText;
                                _d = (_c = JSON).stringify;
                                _e = tandem_front_end_1.getInspectorNodeClipboardData;
                                return [4 /*yield*/, (0, effects_1.select)()];
                            case 2:
                                _b.apply(_a, [_d.apply(_c, [_e.apply(void 0, [_f.sent()])]),
                                    "text/plain"]);
                                return [3 /*break*/, 0];
                            case 3: return [2 /*return*/];
                        }
                    });
                })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(function handlePaste() {
                        var text;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!1) return [3 /*break*/, 3];
                                    return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.INSPECTOR_NODE_CONTEXT_MENU_PASTE_CLICKED)];
                                case 1:
                                    _a.sent();
                                    text = electron_1.clipboard.readText("text/plain");
                                    return [4 /*yield*/, (0, effects_1.put)((0, tandem_front_end_1.inspectorNodePasted)(JSON.parse(text)))];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 0];
                                case 3: return [2 /*return*/];
                            }
                        });
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function handleProjectDirectory() {
    var previousInfo, state;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.PROJECT_INFO_LOADED)];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.select)()];
            case 2:
                state = _a.sent();
                // skip if there are no changes to the config
                if (previousInfo &&
                    state.projectInfo.path === previousInfo.path &&
                    state.projectInfo.config.rootDir === previousInfo.config.rootDir) {
                    return [3 /*break*/, 0];
                }
                previousInfo = state.projectInfo;
                return [4 /*yield*/, (0, effects_1.call)(loadPCFiles)];
            case 3:
                _a.sent();
                return [3 /*break*/, 0];
            case 4: return [2 /*return*/];
        }
    });
}
function loadPCFiles() {
    var projectInfo, sourceFiles;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, effects_1.select)()];
            case 1:
                projectInfo = (_a.sent()).projectInfo;
                if (!projectInfo || !projectInfo.config) {
                    return [2 /*return*/];
                }
                sourceFiles = (0, paperclip_1.findPaperclipSourceFiles)(projectInfo.config, (0, tandem_common_1.stripProtocol)(path.dirname(projectInfo.path))).map(function (path) { return (0, tandem_common_1.addProtocol)(tandem_common_1.FILE_PROTOCOL, path); });
                return [4 /*yield*/, (0, effects_1.put)((0, paperclip_1.pcSourceFileUrisReceived)(sourceFiles))];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function handleBasenameChanged() {
    var _a, basename, item, filePath, newFilePath;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!1) return [3 /*break*/, 2];
                return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.FILE_NAVIGATOR_BASENAME_CHANGED)];
            case 1:
                _a = _b.sent(), basename = _a.basename, item = _a.item;
                filePath = (0, tandem_common_1.stripProtocol)(item.uri);
                newFilePath = path.join(path.dirname(filePath), basename);
                // TODO - this needs to be a prompt
                if (fsa.existsSync(newFilePath)) {
                    console.error("Cannot rename file to ".concat(basename, " since the file already exists."));
                    return [3 /*break*/, 0];
                }
                fsa.renameSync(filePath, newFilePath);
                return [3 /*break*/, 0];
            case 2: return [2 /*return*/];
        }
    });
}
function handleNewFileEntered() {
    var _a, basename, directoryId, insertType, projectDirectory, directory, uri, filePath;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!1) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.FILE_NAVIGATOR_NEW_FILE_ENTERED)];
            case 1:
                _a = _b.sent(), basename = _a.basename, directoryId = _a.directoryId, insertType = _a.insertType;
                return [4 /*yield*/, (0, effects_1.select)()];
            case 2:
                projectDirectory = (_b.sent()).projectDirectory;
                directory = (0, tandem_common_1.getNestedTreeNodeById)(directoryId, projectDirectory);
                uri = directory.uri;
                filePath = path.join((0, tandem_common_1.stripProtocol)(uri), basename);
                if (fs.existsSync(filePath)) {
                    return [3 /*break*/, 0];
                }
                if (insertType === tandem_common_1.FSItemTagNames.FILE) {
                    fs.writeFileSync(filePath, generateBlankFileContent(basename));
                }
                else {
                    fs.mkdirSync(filePath);
                }
                return [4 /*yield*/, (0, effects_1.put)((0, tandem_front_end_1.newFileAdded)((0, tandem_common_1.addProtocol)(tandem_common_1.FILE_PROTOCOL, filePath), insertType))];
            case 3:
                _b.sent();
                return [3 /*break*/, 0];
            case 4: return [2 /*return*/];
        }
    });
}
var generateBlankFileContent = function (basename) {
    var _a;
    if (/\.pc$/.test(basename)) {
        return JSON.stringify((0, paperclip_1.createPCModule)([
            (0, paperclip_1.createPCElement)("div", {}, {}, tandem_common_1.EMPTY_ARRAY, "Frame", (_a = {},
                _a[paperclip_1.PCVisibleNodeMetadataKey.BOUNDS] = (0, tandem_common_1.createBounds)(0, 600, 0, 400),
                _a))
        ]), null, 2);
    }
    return "";
};
function handleDroppedFile() {
    var _a, node, targetNode, offset, root, newNode, newUri, oldUri;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.FILE_NAVIGATOR_DROPPED_ITEM)];
            case 1:
                _a = _b.sent(), node = _a.node, targetNode = _a.targetNode, offset = _a.offset;
                return [4 /*yield*/, (0, effects_1.select)()];
            case 2:
                root = _b.sent();
                newNode = (0, tandem_common_1.getNestedTreeNodeById)(node.id, root.projectDirectory);
                newUri = newNode.uri;
                oldUri = node.uri;
                fsa.moveSync((0, tandem_common_1.stripProtocol)(oldUri), (0, tandem_common_1.stripProtocol)(newUri));
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
function handleSaveShortcut() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.SHORTCUT_SAVE_KEY_DOWN)];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.call)(saveChanges)];
            case 2:
                _a.sent();
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
function saveChanges() {
    var state, activeEditor, _i, _a, openFile;
    return __generator(this, function (_b) {
        switch (_b.label) {
            case 0: return [4 /*yield*/, (0, effects_1.select)()];
            case 1:
                state = _b.sent();
                activeEditor = (0, tandem_front_end_1.getActiveEditorWindow)(state);
                _i = 0, _a = state.openFiles;
                _b.label = 2;
            case 2:
                if (!(_i < _a.length)) return [3 /*break*/, 6];
                openFile = _a[_i];
                if (!openFile.newContent) return [3 /*break*/, 5];
                return [4 /*yield*/, (0, effects_1.call)(saveFile, openFile.uri, openFile.newContent)];
            case 3:
                _b.sent();
                return [4 /*yield*/, (0, effects_1.put)((0, tandem_front_end_1.savedFile)(openFile.uri))];
            case 4:
                _b.sent();
                _b.label = 5;
            case 5:
                _i++;
                return [3 /*break*/, 2];
            case 6: return [2 /*return*/];
        }
    });
}
var saveFile = function (uri, content) {
    return new Promise(function (resolve, reject) {
        fs.writeFile((0, tandem_common_1.stripProtocol)(uri), content, function (err) {
            if (err) {
                return reject(err);
            }
            resolve(null);
        });
    });
};
function watchProjectDirectory() {
    var watcher, watching;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                watching = [];
                return [4 /*yield*/, (0, effects_1.fork)(function startWatcher() {
                        var chan, action, projectDirectory, dirUri, assocDir;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    chan = (0, redux_saga_1.eventChannel)(function (emit) {
                                        watcher = chokidar.watch([], {
                                            depth: 0,
                                            ignoreInitial: true,
                                            persistent: true
                                        });
                                        var actions = [];
                                        // batch to prevent flickering
                                        var batch = (0, lodash_1.debounce)(function () {
                                            var _actions = actions;
                                            actions = [];
                                            _actions.forEach(emit);
                                        }, 10);
                                        watcher.on("all", function (event, path) {
                                            path = (0, tandem_common_1.normalizeFilePath)(path);
                                            if (/\.DS_Store/.test(path)) {
                                                return;
                                            }
                                            actions.push((0, fsbox_1.fileChanged)(event, (0, tandem_common_1.addProtocol)(tandem_common_1.FILE_PROTOCOL, path)));
                                            batch();
                                        });
                                        return function () {
                                            watcher.close();
                                        };
                                    });
                                    _a.label = 1;
                                case 1:
                                    if (!1) return [3 /*break*/, 5];
                                    return [4 /*yield*/, (0, effects_1.take)(chan)];
                                case 2:
                                    action = _a.sent();
                                    return [4 /*yield*/, (0, effects_1.select)()];
                                case 3:
                                    projectDirectory = (_a.sent()).projectDirectory;
                                    dirUri = path.dirname(action.uri);
                                    assocDir = (0, tandem_common_1.getFileFromUri)(dirUri, projectDirectory);
                                    // if dir does not exist, then is not expanded. chokidar has an issue
                                    // where it recursively adds directories, so _not_ doing this can clobber
                                    // the entire process if something like node_modules is present.
                                    // Can probably be fixed another way, but this works for now.
                                    if (!assocDir || !assocDir.expanded) {
                                        return [3 /*break*/, 1];
                                    }
                                    return [4 /*yield*/, (0, effects_1.put)(action)];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 1];
                                case 5: return [2 /*return*/];
                            }
                        });
                    })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(function handleDirsLoaded() {
                        var projectDirectory, expandedFilePaths;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!1) return [3 /*break*/, 3];
                                    return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.PROJECT_DIRECTORY_DIR_LOADED)];
                                case 1:
                                    _a.sent();
                                    return [4 /*yield*/, (0, effects_1.select)()];
                                case 2:
                                    projectDirectory = (_a.sent()).projectDirectory;
                                    expandedFilePaths = (0, tandem_common_1.flattenTreeNode)(projectDirectory)
                                        .map(function (item) { return (0, tandem_common_1.stripProtocol)(item.uri); })
                                        .filter(function (uri) {
                                        return watching.indexOf(uri) === -1;
                                    });
                                    watching.push.apply(watching, expandedFilePaths);
                                    watcher.add(expandedFilePaths);
                                    return [3 /*break*/, 0];
                                case 3: return [2 /*return*/];
                            }
                        });
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(function handleChangedFiles() {
                        var _a, eventType, uri, filePath, i;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!1) return [3 /*break*/, 2];
                                    return [4 /*yield*/, (0, effects_1.take)(fsbox_1.FILE_CHANGED)];
                                case 1:
                                    _a = _b.sent(), eventType = _a.eventType, uri = _a.uri;
                                    filePath = (0, tandem_common_1.stripProtocol)(uri);
                                    switch (eventType) {
                                        case fsbox_1.FileChangedEventType.ADD_DIR:
                                        case fsbox_1.FileChangedEventType.ADD: {
                                            if (watching.indexOf(filePath) === -1) {
                                                watching.push(filePath);
                                                watcher.add(filePath);
                                            }
                                            break;
                                        }
                                        case fsbox_1.FileChangedEventType.UNLINK_DIR:
                                        case fsbox_1.FileChangedEventType.UNLINK: {
                                            i = watching.indexOf(filePath);
                                            if (i !== -1) {
                                                watching.splice(i, 1);
                                            }
                                            break;
                                        }
                                    }
                                    return [3 /*break*/, 0];
                                case 2: return [2 /*return*/];
                            }
                        });
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function escapeRegExp(string) {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
function handleQuickSearch() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, effects_1.throttle)(10, tandem_front_end_1.QUICK_SEARCH_FILTER_CHANGED, function () {
                    var _a, quickSearch, projectInfo, pattern, projectDir, results;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, (0, effects_1.select)()];
                            case 1:
                                _a = _b.sent(), quickSearch = _a.quickSearch, projectInfo = _a.projectInfo;
                                if (!projectInfo) {
                                    return [2 /*return*/];
                                }
                                if (!quickSearch.filter) {
                                    return [2 /*return*/];
                                }
                                pattern = new RegExp(escapeRegExp(quickSearch.filter)
                                    .split(" ")
                                    .join(".*?"), "i");
                                projectDir = path.dirname(projectInfo.path);
                                results = [];
                                (0, paperclip_1.walkPCRootDirectory)(projectInfo.config, projectDir, function (filePath, isDirectory) {
                                    if (!isDirectory && pattern.test(filePath)) {
                                        results.push({
                                            uri: (0, tandem_common_1.addProtocol)(tandem_common_1.FILE_PROTOCOL, filePath),
                                            label: path.basename(filePath),
                                            description: path.dirname(filePath),
                                            type: tandem_front_end_1.QuickSearchResultType.URI
                                        });
                                    }
                                });
                                return [4 /*yield*/, (0, effects_1.put)((0, tandem_front_end_1.quickSearchFilterResultLoaded)(results.slice(0, 50)))];
                            case 2:
                                _b.sent();
                                return [2 /*return*/];
                        }
                    });
                })];
            case 1:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function chromeSaga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, effects_1.fork)(function handleHeaderClick() {
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                if (!1) return [3 /*break*/, 2];
                                return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.CHROME_HEADER_MOUSE_DOWN)];
                            case 1:
                                _a.sent();
                                return [3 /*break*/, 0];
                            case 2: return [2 /*return*/];
                        }
                    });
                })];
            case 1:
                _a.sent();
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
                return [4 /*yield*/, (0, effects_1.fork)(function handleConfirmClose() {
                        var _a, save, cancel, closeWithoutSaving;
                        return __generator(this, function (_b) {
                            switch (_b.label) {
                                case 0:
                                    if (!1) return [3 /*break*/, 6];
                                    return [4 /*yield*/, (0, effects_1.take)(tandem_front_end_1.CONFIRM_CLOSE_WINDOW)];
                                case 1:
                                    _a = _b.sent(), save = _a.save, cancel = _a.cancel, closeWithoutSaving = _a.closeWithoutSaving;
                                    if (cancel) {
                                        return [3 /*break*/, 0];
                                    }
                                    if (!save) return [3 /*break*/, 3];
                                    return [4 /*yield*/, (0, effects_1.call)(saveChanges)];
                                case 2:
                                    _b.sent();
                                    _b.label = 3;
                                case 3:
                                    if (!(save || closeWithoutSaving)) return [3 /*break*/, 5];
                                    return [4 /*yield*/, (0, effects_1.call)(tandem_front_end_2.unloadApplication, function () {
                                            return __generator(this, function (_a) {
                                                window.close();
                                                return [2 /*return*/];
                                            });
                                        })];
                                case 4:
                                    _b.sent();
                                    _b.label = 5;
                                case 5: return [3 /*break*/, 0];
                                case 6: return [2 /*return*/];
                            }
                        });
                    })];
            case 2:
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
                _a.sent();
                return [2 /*return*/];
        }
    });
}
//# sourceMappingURL=index.js.map