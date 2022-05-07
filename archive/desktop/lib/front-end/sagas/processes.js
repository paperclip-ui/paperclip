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
exports.processSaga = void 0;
var effects_1 = require("redux-saga/effects");
var redux_saga_1 = require("redux-saga");
var terminate = require("terminate");
var path = require("path");
var child_process_1 = require("child_process");
var tandem_front_end_1 = require("tandem-front-end");
var tandem_common_1 = require("tandem-common");
function processSaga() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.fork(handleStartBuild)];
            case 1:
                _a.sent();
                return [4 /*yield*/, effects_1.fork(handleOpenApp)];
            case 2:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
exports.processSaga = processSaga;
var UNLOADER_TIMEOUT = 500;
function handleStartBuild() {
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 3];
                return [4 /*yield*/, effects_1.take([tandem_front_end_1.BUILD_BUTTON_START_CLICKED])];
            case 1:
                _a.sent();
                return [4 /*yield*/, effects_1.call(startBuild)];
            case 2:
                _a.sent();
                return [3 /*break*/, 0];
            case 3: return [2 /*return*/];
        }
    });
}
function handleOpenApp() {
    var state, openAppScript;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (!1) return [3 /*break*/, 4];
                return [4 /*yield*/, effects_1.take(tandem_front_end_1.BUILD_BUTTON_OPEN_APP_CLICKED)];
            case 1:
                _a.sent();
                return [4 /*yield*/, effects_1.select()];
            case 2:
                state = _a.sent();
                openAppScript = state.projectInfo.config.scripts.openApp;
                return [4 /*yield*/, effects_1.call(spawnScript, openAppScript, "Open App", path.dirname(tandem_common_1.stripProtocol(state.projectInfo.path)))];
            case 3:
                _a.sent();
                return [3 /*break*/, 0];
            case 4: return [2 /*return*/];
        }
    });
}
function startBuild() {
    var state, buildScript, scriptProcess;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, effects_1.select()];
            case 1:
                state = _a.sent();
                buildScript = state.projectInfo.config.scripts.build;
                return [4 /*yield*/, effects_1.call(spawnScript, buildScript, "Build", path.dirname(tandem_common_1.stripProtocol(state.projectInfo.path)))];
            case 2:
                scriptProcess = _a.sent();
                // check if process has been removed from state
                return [4 /*yield*/, effects_1.fork(function handleScriptChanged() {
                        var action, state_1, matchingProccess;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    if (!1) return [3 /*break*/, 6];
                                    return [4 /*yield*/, effects_1.take([
                                            tandem_front_end_1.BUILD_SCRIPT_CONFIG_CHANGED,
                                            tandem_front_end_1.BUILD_BUTTON_STOP_CLICKED,
                                            tandem_front_end_1.TD_PROJECT_LOADED
                                        ])];
                                case 1:
                                    action = _a.sent();
                                    // slight pause to ensure that reducer is called first
                                    return [4 /*yield*/, redux_saga_1.delay(0)];
                                case 2:
                                    // slight pause to ensure that reducer is called first
                                    _a.sent();
                                    if (action.type === tandem_front_end_1.BUILD_BUTTON_STOP_CLICKED) {
                                        return [3 /*break*/, 6];
                                    }
                                    return [4 /*yield*/, effects_1.select()];
                                case 3:
                                    state_1 = _a.sent();
                                    matchingProccess = state_1.scriptProcesses.find(function (proc) { return proc.id === scriptProcess.id; });
                                    if (!!matchingProccess) return [3 /*break*/, 5];
                                    return [4 /*yield*/, effects_1.call(startBuild)];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 6];
                                case 5: return [3 /*break*/, 0];
                                case 6: return [2 /*return*/];
                            }
                        });
                    })];
            case 3:
                // check if process has been removed from state
                _a.sent();
                return [4 /*yield*/, effects_1.put(tandem_front_end_1.buildScriptStarted(scriptProcess))];
            case 4:
                _a.sent();
                return [2 /*return*/];
        }
    });
}
function spawnScript(script, label, cwd) {
    var scriptProcess;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                scriptProcess = tandem_front_end_1.createScriptProcess(label, script);
                return [4 /*yield*/, effects_1.put(tandem_front_end_1.scriptProcessStarted(scriptProcess))];
            case 1:
                _a.sent();
                return [4 /*yield*/, effects_1.spawn(function () {
                        var channel, event_1;
                        return __generator(this, function (_a) {
                            switch (_a.label) {
                                case 0:
                                    channel = redux_saga_1.eventChannel(function (emit) {
                                        console.log("spawning", script);
                                        var proc = child_process_1.spawn(script, [], {
                                            shell: true,
                                            cwd: cwd
                                        });
                                        proc.stderr.on("data", function (chunk) {
                                            return emit({
                                                type: "stderr",
                                                chunk: chunk
                                            });
                                        });
                                        proc.stdout.on("data", function (chunk) {
                                            return emit({
                                                type: "stdout",
                                                chunk: chunk
                                            });
                                        });
                                        proc.on("exit", function () { return emit({ type: "close" }); });
                                        proc.on("close", function () { return emit({ type: "close" }); });
                                        return function () {
                                            console.log("terminate process", proc.pid);
                                            terminate(proc.pid);
                                        };
                                    });
                                    // check if process has been removed from state
                                    return [4 /*yield*/, effects_1.spawn(function () {
                                            var state, matchingProccess, unloader;
                                            return __generator(this, function (_a) {
                                                switch (_a.label) {
                                                    case 0:
                                                        if (!1) return [3 /*break*/, 7];
                                                        return [4 /*yield*/, effects_1.take([
                                                                tandem_front_end_1.BUILD_SCRIPT_CONFIG_CHANGED,
                                                                tandem_front_end_1.SCRIPT_PROCESS_CLOSED,
                                                                tandem_front_end_1.BUILD_BUTTON_STOP_CLICKED,
                                                                tandem_front_end_1.TD_PROJECT_LOADED,
                                                                tandem_front_end_1.UNLOADING
                                                            ])];
                                                    case 1:
                                                        _a.sent();
                                                        return [4 /*yield*/, effects_1.select()];
                                                    case 2:
                                                        state = _a.sent();
                                                        matchingProccess = state.scriptProcesses.find(function (proc) { return proc.id === scriptProcess.id; });
                                                        if (!!matchingProccess) return [3 /*break*/, 6];
                                                        unloader = tandem_front_end_1.createUnloader();
                                                        return [4 /*yield*/, effects_1.put(tandem_front_end_1.unloaderCreated(unloader))];
                                                    case 3:
                                                        _a.sent();
                                                        channel.close();
                                                        // give some time for async terminator to work. Could
                                                        // cause race conditions. 🙈
                                                        return [4 /*yield*/, effects_1.call(redux_saga_1.delay, UNLOADER_TIMEOUT)];
                                                    case 4:
                                                        // give some time for async terminator to work. Could
                                                        // cause race conditions. 🙈
                                                        _a.sent();
                                                        return [4 /*yield*/, effects_1.put(tandem_front_end_1.unloaderCompleted(unloader))];
                                                    case 5:
                                                        _a.sent();
                                                        return [3 /*break*/, 7];
                                                    case 6: return [3 /*break*/, 0];
                                                    case 7: return [2 /*return*/];
                                                }
                                            });
                                        })];
                                case 1:
                                    // check if process has been removed from state
                                    _a.sent();
                                    _a.label = 2;
                                case 2:
                                    if (!1) return [3 /*break*/, 10];
                                    return [4 /*yield*/, effects_1.take(channel)];
                                case 3:
                                    event_1 = _a.sent();
                                    if (!(event_1.type === "close")) return [3 /*break*/, 5];
                                    return [4 /*yield*/, effects_1.put(tandem_front_end_1.scriptProcessStopped(scriptProcess))];
                                case 4:
                                    _a.sent();
                                    return [3 /*break*/, 10];
                                case 5:
                                    if (!(event_1.type === "stdout")) return [3 /*break*/, 7];
                                    return [4 /*yield*/, effects_1.put(tandem_front_end_1.scriptProcessLog(scriptProcess, {
                                            text: String(event_1.chunk),
                                            error: false
                                        }))];
                                case 6:
                                    _a.sent();
                                    return [3 /*break*/, 9];
                                case 7:
                                    if (!(event_1.type === "stderr")) return [3 /*break*/, 9];
                                    return [4 /*yield*/, effects_1.put(tandem_front_end_1.scriptProcessLog(scriptProcess, {
                                            text: String(event_1.chunk),
                                            error: true
                                        }))];
                                case 8:
                                    _a.sent();
                                    _a.label = 9;
                                case 9: return [3 /*break*/, 2];
                                case 10: return [2 /*return*/];
                            }
                        });
                    })];
            case 2:
                _a.sent();
                return [2 /*return*/, scriptProcess];
        }
    });
}
//# sourceMappingURL=processes.js.map