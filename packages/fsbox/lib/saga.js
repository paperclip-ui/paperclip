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
exports.createFSSandboxSaga = exports.setReaderMimetype = void 0;
var path = require("path");
var effects_1 = require("redux-saga/effects");
var state_1 = require("./state");
var actions_1 = require("./actions");
var setReaderMimetype = function (mimeType, extensions) { return function (readFile) { return function (uri) { return __awaiter(void 0, void 0, void 0, function () {
    var content;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (extensions.indexOf(path.extname(uri)) === -1) {
                    return [2 /*return*/, readFile(uri)];
                }
                return [4 /*yield*/, readFile(uri)];
            case 1:
                content = (_a.sent()).content;
                return [2 /*return*/, { content: content, mimeType: mimeType }];
        }
    });
}); }; }; };
exports.setReaderMimetype = setReaderMimetype;
var createFSSandboxSaga = function (_a) {
    var readFile = _a.readFile, writeFile = _a.writeFile;
    return function () {
        function handleUpdatedFile(item) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(item.status === state_1.FileCacheItemStatus.CREATED)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, effects_1.call)(loadFile, item.uri)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(item.status === state_1.FileCacheItemStatus.SAVE_REQUESTED)) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, effects_1.call)(saveFile, item)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }
        function loadFile(uri) {
            var _a, content, mimeType;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, effects_1.put)((0, actions_1.fsSandboxItemLoading)(uri))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, effects_1.call)(readFile, uri)];
                    case 2:
                        _a = _b.sent(), content = _a.content, mimeType = _a.mimeType;
                        return [4 /*yield*/, (0, effects_1.put)((0, actions_1.fsSandboxItemLoaded)(uri, content, mimeType))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }
        function saveFile(_a) {
            var uri = _a.uri, content = _a.content;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, effects_1.put)((0, actions_1.fsSandboxItemSaving)(uri))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, effects_1.call)(writeFile, uri, content)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, effects_1.put)((0, actions_1.fsSandboxItemSaved)(uri))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, effects_1.fork)(function handleFileChanges() {
                        var prevState, state, updatedFiles, uri, _a, _b, _i, uri;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (!1) return [3 /*break*/, 7];
                                    return [4 /*yield*/, (0, effects_1.take)()];
                                case 1:
                                    _c.sent();
                                    return [4 /*yield*/, (0, effects_1.select)()];
                                case 2:
                                    state = _c.sent();
                                    if (prevState && state.fileCache === prevState.fileCache) {
                                        return [3 /*break*/, 0];
                                    }
                                    updatedFiles = {};
                                    for (uri in state.fileCache) {
                                        if (!prevState || prevState.fileCache[uri] !== state.fileCache[uri]) {
                                            updatedFiles[uri] = state.fileCache[uri];
                                        }
                                    }
                                    prevState = state;
                                    _a = [];
                                    for (_b in updatedFiles)
                                        _a.push(_b);
                                    _i = 0;
                                    _c.label = 3;
                                case 3:
                                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                                    uri = _a[_i];
                                    return [4 /*yield*/, (0, effects_1.spawn)(handleUpdatedFile, updatedFiles[uri])];
                                case 4:
                                    _c.sent();
                                    _c.label = 5;
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 3];
                                case 6: return [3 /*break*/, 0];
                                case 7: return [2 /*return*/];
                            }
                        });
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, effects_1.fork)(function handleLocalChanges() {
                            var _loop_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _loop_1 = function () {
                                            var uri, state;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0: return [4 /*yield*/, (0, effects_1.take)(function (action) {
                                                            return (action.type === actions_1.FILE_CHANGED &&
                                                                action.eventType === actions_1.FileChangedEventType.CHANGE);
                                                        })];
                                                    case 1:
                                                        uri = (_b.sent()).uri;
                                                        return [4 /*yield*/, (0, effects_1.select)()];
                                                    case 2:
                                                        state = _b.sent();
                                                        // This will happen if FileChanged is fired on a FS item that isn't also in cache. I.e:
                                                        // the changed FS item has not _explicitly_ been added via queueOpenFile
                                                        if (!state.fileCache[uri]) {
                                                            return [2 /*return*/, "continue"];
                                                        }
                                                        return [4 /*yield*/, (0, effects_1.spawn)(function () {
                                                                return __generator(this, function (_a) {
                                                                    switch (_a.label) {
                                                                        case 0: return [4 /*yield*/, (0, effects_1.call)(loadFile, uri)];
                                                                        case 1:
                                                                            _a.sent();
                                                                            return [2 /*return*/];
                                                                    }
                                                                });
                                                            })];
                                                    case 3:
                                                        _b.sent();
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
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
};
exports.createFSSandboxSaga = createFSSandboxSaga;
//# sourceMappingURL=saga.js.map