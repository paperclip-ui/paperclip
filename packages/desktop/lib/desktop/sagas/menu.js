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
exports.shortcutsSaga = void 0;
var electron_1 = require("electron");
var effects_1 = require("redux-saga/effects");
var redux_saga_1 = require("redux-saga");
var child_process_1 = require("child_process");
var os_1 = require("os");
var actions_1 = require("../actions");
var tandem_common_1 = require("tandem-common");
var shortcutKeyDown = (0, tandem_common_1.publicActionCreator)(function (type) { return ({
    type: type
}); });
function shortcutsSaga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, effects_1.take)(actions_1.MAIN_WINDOW_OPENED)];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleMenu)];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(handleFSItemContextMenuOptions)];
            case 3:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
exports.shortcutsSaga = shortcutsSaga;
function handleFSItemContextMenuOptions() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, effects_1.takeEvery)("FILE_ITEM_CONTEXT_MENU_COPY_PATH_CLICKED", function (_a) {
                    var item = _a.item;
                    electron_1.clipboard.writeText((0, tandem_common_1.stripProtocol)(item.uri));
                })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.takeEvery)("FILE_ITEM_CONTEXT_MENU_OPEN_IN_FINDER_CLICKED", function (_a) {
                        var item = _a.item;
                        var path = (0, tandem_common_1.stripProtocol)(item.uri);
                    })];
            case 2:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.takeEvery)("FILE_ITEM_CONTEXT_MENU_OPEN_CLICKED", function (_a) {
                        var item = _a.item;
                        var path = (0, tandem_common_1.stripProtocol)(item.uri);
                        (0, child_process_1.exec)("open ".concat(path.replace(/\s/g, "\\ ")));
                    })];
            case 3:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.takeEvery)("OPEN_TEXT_EDITOR_BUTTON_CLICKED", function (_a) {
                        var uri = _a.uri;
                        var path = (0, tandem_common_1.stripProtocol)(uri);
                        (0, child_process_1.exec)("open ".concat(path.replace(/\s/g, "\\ ")));
                    })];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
var cmdKey = (0, os_1.platform)() === "win32" ? "ctrl" : "meta";
function handleMenu() {
    var menu, chan, action;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                menu = new electron_1.Menu();
                chan = (0, redux_saga_1.eventChannel)(function (emit) {
                    var tpl = [
                        {
                            label: electron_1.app.getName(),
                            submenu: [
                                { role: "about" },
                                { type: "separator" },
                                { role: "services", submenu: [] },
                                { type: "separator" },
                                { role: "hide" },
                                // { role: "hideothers" },
                                { role: "unhide" },
                                { type: "separator" },
                                { role: "quit" },
                                { type: "separator" },
                                { type: "separator" }
                            ]
                        },
                        {
                            label: "Edit",
                            submenu: [
                                {
                                    label: "Undo",
                                    accelerator: "".concat(cmdKey, "+z"),
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_UNDO_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Redo",
                                    accelerator: "".concat(cmdKey, "+y"),
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_REDO_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Convert to component",
                                    accelerator: "alt+c",
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_CONVERT_TO_COMPONENT_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Wrap in slot",
                                    accelerator: "alt+s",
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_WRAP_IN_SLOT_KEY_DOWN"));
                                    }
                                },
                                { type: "separator" },
                                { role: "cut" },
                                { role: "copy" },
                                { role: "paste" },
                                // { role: "pasteandmatchstyle" },
                                {
                                    label: "Delete",
                                    accelerator: "Backspace",
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_DELETE_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Escape",
                                    accelerator: "Escape",
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_ESCAPE_KEY_DOWN"));
                                    }
                                }
                                // { role: "selectall" }
                            ]
                        },
                        {
                            label: "File",
                            submenu: [
                                {
                                    label: "Save",
                                    accelerator: "".concat(cmdKey, "+s"),
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_SAVE_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Search",
                                    accelerator: "".concat(cmdKey, "+t"),
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_QUICK_SEARCH_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Open Project...",
                                    accelerator: "".concat(cmdKey, "+o"),
                                    click: function () {
                                        emit(shortcutKeyDown(actions_1.OPEN_PROJECT_MENU_ITEM_CLICKED));
                                    }
                                }
                                // {
                                //   label: "New Project...",
                                //   accelerator: `${cmdKey}+shift+n`,
                                //   click: () => {
                                //     emit(shortcutKeyDown(NEW_PROJECT_MENU_ITEM_CLICKED));
                                //   }
                                // }
                            ]
                        },
                        {
                            label: "Insert",
                            submenu: [
                                {
                                    label: "Text",
                                    accelerator: "t",
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_T_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Element",
                                    accelerator: "r",
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_R_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Component",
                                    accelerator: "c",
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_C_KEY_DOWN"));
                                    }
                                }
                            ]
                        },
                        {
                            label: "View",
                            submenu: [
                                {
                                    label: "Reload",
                                    accelerator: "".concat(cmdKey, "+r"),
                                    click: function (a, window, event) {
                                        emit(shortcutKeyDown("RELOAD"));
                                    }
                                },
                                { role: "toggledevtools" },
                                { type: "separator" },
                                ,
                                // { role: "resetzoom" },
                                {
                                    label: "Zoom In",
                                    accelerator: "".concat(cmdKey, "+="),
                                    click: function (a, window, event) {
                                        emit(shortcutKeyDown("SHORTCUT_ZOOM_IN_KEY_DOWN"));
                                    }
                                },
                                {
                                    label: "Zoom Out",
                                    accelerator: "".concat(cmdKey, "+-"),
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_ZOOM_OUT_KEY_DOWN"));
                                    }
                                },
                                { type: "separator" },
                                { role: "togglefullscreen" },
                                {
                                    label: "Toggle Side Bar",
                                    accelerator: "".concat(cmdKey, "+b"),
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_TOGGLE_SIDEBAR"));
                                    }
                                },
                                {
                                    label: "Toggle Panel",
                                    accelerator: "".concat(cmdKey, "+j"),
                                    click: function () {
                                        emit(shortcutKeyDown("SHORTCUT_TOGGLE_PANEL"));
                                    }
                                },
                                {
                                    label: "Select Next Tab",
                                    accelerator: "".concat(cmdKey, "+shift+]"),
                                    click: function (a, window, event) {
                                        emit(shortcutKeyDown("SHORTCUT_SELECT_NEXT_TAB"));
                                    }
                                },
                                {
                                    label: "Select Previous Tab",
                                    accelerator: "".concat(cmdKey, "+shift+["),
                                    click: function (a, window, event) {
                                        emit(shortcutKeyDown("SHORTCUT_SELECT_PREVIOUS_TAB"));
                                    }
                                },
                                {
                                    label: "Close Current Tab",
                                    accelerator: "".concat(cmdKey, "+w"),
                                    click: function (a, window, event) {
                                        emit(shortcutKeyDown("SHORTCUT_CLOSE_CURRENT_TAB"));
                                    }
                                }
                            ]
                        },
                        {
                            label: "Help",
                            submenu: [
                                {
                                    label: "Tutorials",
                                    click: function () {
                                        emit({
                                            type: "LINK_CICKED",
                                            url: "https://www.youtube.com/playlist?list=PLCNS_PVbhoSXOrjiJQP7ZjZJ4YHULnB2y",
                                            "@@public": true
                                        });
                                    }
                                }
                            ]
                        }
                    ];
                    electron_1.Menu.setApplicationMenu(electron_1.Menu.buildFromTemplate(tpl));
                    return function () { };
                });
                _a.label = 1;
            case 1:
                if (!1) return [3 /*break*/, 4];
                return [4 /*yield*/, (0, effects_1.take)(chan)];
            case 2:
                action = _a.sent();
                return [4 /*yield*/, (0, effects_1.put)(action)];
            case 3:
                _a.sent();
                return [3 /*break*/, 1];
            case 4: return [2 /*return*/];
        }
    });
}
//# sourceMappingURL=menu.js.map