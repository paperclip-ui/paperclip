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
exports.ipcSaga = void 0;
var electron_1 = require("electron");
var effects_1 = require("redux-saga/effects");
var redux_saga_1 = require("redux-saga");
var tandem_common_1 = require("tandem-common");
var pid = Date.now() + "_" + Math.random();
function ipcSaga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, (0, effects_1.fork)(function () {
                    var input, _loop_1;
                    return __generator(this, function (_a) {
                        switch (_a.label) {
                            case 0:
                                input = (0, redux_saga_1.eventChannel)(function (emit) {
                                    electron_1.ipcRenderer.on("message", function (event, arg) {
                                        emit(arg);
                                    });
                                    return function () { };
                                });
                                _loop_1 = function () {
                                    var event_1;
                                    return __generator(this, function (_b) {
                                        switch (_b.label) {
                                            case 0: return [4 /*yield*/, (0, effects_1.take)(input)];
                                            case 1:
                                                event_1 = _b.sent();
                                                event_1["@@" + pid] = true;
                                                return [4 /*yield*/, (0, effects_1.fork)(function () {
                                                        return __generator(this, function (_a) {
                                                            switch (_a.label) {
                                                                case 0: return [4 /*yield*/, (0, effects_1.put)(event_1)];
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
                })];
            case 1:
                _a.sent();
                return [4 /*yield*/, (0, effects_1.fork)(function () {
                        var action;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!1) return [3 /*break*/, 2];
                                    return [4 /*yield*/, (0, effects_1.take)()];
                                case 1:
                                    action = _a.sent();
                                    if ((0, tandem_common_1.isPublicAction)(action) && !action["@@" + pid]) {
                                        electron_1.ipcRenderer.send("message", action);
                                    }
                                    return [3 /*break*/, 0];
                                case 2: return [2 /*return*/];
                            }
                        });
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
exports.ipcSaga = ipcSaga;
//# sourceMappingURL=ipc.js.map