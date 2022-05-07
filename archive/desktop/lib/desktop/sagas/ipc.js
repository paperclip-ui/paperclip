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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.ipcSaga = exports.pid = void 0;
var effects_1 = require("redux-saga/effects");
var redux_saga_1 = require("redux-saga");
var electron_1 = require("electron");
var electron_2 = require("electron");
var tandem_common_1 = require("tandem-common");
exports.pid = Date.now() + "_" + Math.random();
function ipcSaga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.fork(actionSaga)];
            case 1:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(apiSaga)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
exports.ipcSaga = ipcSaga;
function actionSaga() {
    var chan, _loop_1;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                chan = takeIPCEvents("message");
                _loop_1 = function () {
                    var _a, message, event_1;
                    return __generator(this, function (_b) {
                        switch (_b.label) {
                            case 0: return [4 /*yield*/, effects_1.take(chan)];
                            case 1:
                                _a = _b.sent(), message = _a.arg, event_1 = _a.event;
                                message["@@" + exports.pid] = true;
                                console.log("incomming IPC message:", message);
                                return [4 /*yield*/, effects_1.spawn(function () {
                                        return __generator(this, function (_a) {
                                            switch (_a.label) {
                                                case 0: return [4 /*yield*/, effects_1.put(__assign(__assign({}, message), { origin: event_1 }))];
                                                case 1:
                                                    _a.sent();
                                                    return [2 /*return*/];
                                            }
                                        });
                                    })];
                            case 2:
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
}
tandem_common_1.normalizeFilePath;
function apiSaga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.fork(function getProjectInfo() {
                    var chan, event_2, state;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                chan = takeIPCEvents("getProjectInfo");
                                _a.label = 1;
                            case 1:
                                if (!1) return [3 /*break*/, 4];
                                return [4 /*yield*/, effects_1.take(chan)];
                            case 2:
                                event_2 = (_a.sent()).event;
                                return [4 /*yield*/, effects_1.select()];
                            case 3:
                                state = _a.sent();
                                event_2.sender.send("projectInfo", state.tdProject && {
                                    config: state.tdProject,
                                    path: state.tdProjectPath
                                });
                                return [3 /*break*/, 1];
                            case 4: return [2 /*return*/];
                        }
                    });
                })];
            case 1:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(function openDialog() {
                        var chan, _a, event_3, _b, name_1, extensions, filePath;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    chan = takeIPCEvents("openDialog");
                                    _c.label = 1;
                                case 1:
                                    if (!1) return [3 /*break*/, 3];
                                    return [4 /*yield*/, effects_1.take(chan)];
                                case 2:
                                    _a = _c.sent(), event_3 = _a.event, _b = _a.arg, name_1 = _b.name, extensions = _b.extensions;
                                    filePath = (electron_2.dialog.showOpenDialog({
                                        filters: [
                                            {
                                                name: name_1,
                                                extensions: extensions
                                            }
                                        ],
                                        properties: ["openFile"]
                                    }) || [undefined])[0];
                                    event_3.sender.send("openDialogResult", filePath);
                                    return [3 /*break*/, 1];
                                case 3: return [2 /*return*/];
                            }
                        });
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(function openContextMenu() {
                        var chan, _loop_2;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    chan = takeIPCEvents("openContextMenu");
                                    _loop_2 = function () {
                                        var _a, event_4, _b, point, options, menuChan, action;
                                        return __generator(this, function (_c) {
                                            switch (_c.label) {
                                                case 0: return [4 /*yield*/, effects_1.take(chan)];
                                                case 1:
                                                    _a = _c.sent(), event_4 = _a.event, _b = _a.arg, point = _b.point, options = _b.options;
                                                    menuChan = redux_saga_1.eventChannel(function (emit) {
                                                        var menu = generateMenu(options, emit);
                                                        menu.popup({
                                                            window: event_4.sender,
                                                            x: Math.round(point.left),
                                                            y: Math.round(point.top)
                                                        });
                                                        // come after click
                                                        menu.once("menu-will-close", function () { return setTimeout(emit, 10, "CLOSED"); });
                                                        return function () {
                                                            menu.closePopup();
                                                        };
                                                    });
                                                    return [4 /*yield*/, effects_1.take(menuChan)];
                                                case 2:
                                                    action = _c.sent();
                                                    if (!(action !== "CLOSED")) return [3 /*break*/, 4];
                                                    return [4 /*yield*/, effects_1.put(action)];
                                                case 3:
                                                    _c.sent();
                                                    _c.label = 4;
                                                case 4: return [2 /*return*/];
                                            }
                                        });
                                    };
                                    _a.label = 1;
                                case 1:
                                    if (!1) return [3 /*break*/, 3];
                                    return [5 /*yield**/, _loop_2()];
                                case 2:
                                    _a.sent();
                                    return [3 /*break*/, 1];
                                case 3: return [2 /*return*/];
                            }
                        });
                    })];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
var generateMenu = function (options, dispatch) {
    var tpl = generateMenuTpl(options, dispatch);
    var menu = electron_1.Menu.buildFromTemplate(tpl);
    return menu;
};
var generateMenuTpl = function (options, click) {
    return options.reduce(function (items, option, i) {
        if (option.type === "group") {
            items = __spreadArrays(items, generateMenuTpl(option.options, click));
            if (i !== options.length - 1) {
                items.push({ type: "separator" });
            }
            return items;
        }
        else if (option.type === "item") {
            return __spreadArrays(items, [
                {
                    label: option.label,
                    click: function () { return click(option.action); }
                }
            ]);
        }
    }, []);
};
var takeIPCEvents = function (eventType) {
    return redux_saga_1.eventChannel(function (emit) {
        electron_1.ipcMain.on(eventType, function (event, arg) { return emit({ event: event, arg: arg }); });
        return function () { };
    });
};
//# sourceMappingURL=ipc.js.map