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
exports.createPaperclipSaga = void 0;
var redux_saga_1 = require("redux-saga");
var effects_1 = require("redux-saga/effects");
var actions_1 = require("./actions");
var dom_renderer_1 = require("./dom-renderer");
var tandem_common_1 = require("tandem-common");
var edit_1 = require("./edit");
var synthetic_1 = require("./synthetic");
var fsbox_1 = require("fsbox");
var getRuntimeInfo = (0, tandem_common_1.memoize)(function (graph, rootDirectory, variants, priorityUris) {
    return {
        graph: graph,
        rootDirectory: rootDirectory,
        variants: variants,
        priorityUris: priorityUris
    };
});
var createPaperclipSaga = function (_a) {
    var createRuntime = _a.createRuntime, getRuntimeVariants = _a.getRuntimeVariants, getPriorityUris = _a.getPriorityUris, getRootDirectory = _a.getRootDirectory;
    return function paperclipSaga() {
        function runtime() {
            var rt, chan, graph, state;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        rt = createRuntime();
                        chan = (0, redux_saga_1.eventChannel)(function (emit) {
                            rt.on("evaluate", function (newDocuments, diffs, deletedDocumentIds, timestamp) {
                                emit((0, actions_1.pcRuntimeEvaluated)(newDocuments, diffs, rt.syntheticDocuments, timestamp < rt.lastUpdatedAt));
                            });
                            return function () { };
                        });
                        return [4 /*yield*/, (0, effects_1.fork)(function () {
                                var _a;
                                return __generator(this, function (_b) {
                                    switch (_b.label) {
                                        case 0:
                                            if (!1) return [3 /*break*/, 3];
                                            _a = effects_1.put;
                                            return [4 /*yield*/, (0, effects_1.take)(chan)];
                                        case 1: return [4 /*yield*/, _a.apply(void 0, [_b.sent()])];
                                        case 2:
                                            _b.sent();
                                            return [3 /*break*/, 0];
                                        case 3: return [2 /*return*/];
                                    }
                                });
                            })];
                    case 1:
                        _a.sent();
                        _a.label = 2;
                    case 2:
                        if (!1) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, effects_1.take)()];
                    case 3:
                        _a.sent();
                        return [4 /*yield*/, (0, effects_1.select)()];
                    case 4:
                        state = _a.sent();
                        if ((0, fsbox_1.fsCacheBusy)(state.fileCache)) {
                            return [3 /*break*/, 2];
                        }
                        if (graph !== state.graph) {
                            graph = state.graph;
                        }
                        rt.setInfo(getRuntimeInfo(state.graph, getRootDirectory(state), getRuntimeVariants(state), getPriorityUris(state)));
                        return [3 /*break*/, 2];
                    case 5: return [2 /*return*/];
                }
            });
        }
        function nativeRenderer() {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0: return [4 /*yield*/, (0, effects_1.fork)(function captureFrameChanges() {
                            var prevState, diffs, marker, state, allDocUris, _i, allDocUris_1, uri, newDocument, ots, _loop_1, _a, _b, newFrame;
                            return __generator(this, function (_c) {
                                switch (_c.label) {
                                    case 0:
                                        if (!1) return [3 /*break*/, 9];
                                        return [4 /*yield*/, (0, effects_1.take)(actions_1.PC_RUNTIME_EVALUATED)];
                                    case 1:
                                        diffs = (_c.sent()).diffs;
                                        marker = (0, tandem_common_1.pmark)("*nativeRenderer()");
                                        return [4 /*yield*/, (0, effects_1.select)()];
                                    case 2:
                                        state = _c.sent();
                                        allDocUris = Object.keys(state.graph);
                                        _i = 0, allDocUris_1 = allDocUris;
                                        _c.label = 3;
                                    case 3:
                                        if (!(_i < allDocUris_1.length)) return [3 /*break*/, 8];
                                        uri = allDocUris_1[_i];
                                        newDocument = (0, synthetic_1.getSyntheticDocumentByDependencyUri)(uri, state.documents, state.graph);
                                        if (!newDocument) {
                                            return [3 /*break*/, 7];
                                        }
                                        ots = diffs[uri] || tandem_common_1.EMPTY_ARRAY;
                                        _loop_1 = function (newFrame) {
                                            var frameOts, oldFrame, oldDocument;
                                            return __generator(this, function (_d) {
                                                switch (_d.label) {
                                                    case 0:
                                                        if (!(!initedFrames[newFrame.syntheticContentNodeId] ||
                                                            !newFrame.$container)) return [3 /*break*/, 2];
                                                        initedFrames[newFrame.syntheticContentNodeId] = true;
                                                        return [4 /*yield*/, (0, effects_1.spawn)(initContainer, newFrame, state.graph)];
                                                    case 1:
                                                        _d.sent();
                                                        return [3 /*break*/, 4];
                                                    case 2:
                                                        frameOts = mapContentNodeOperationalTransforms(newFrame.syntheticContentNodeId, newDocument, ots);
                                                        oldFrame = prevState &&
                                                            prevState.frames.find(function (oldFrame) {
                                                                return oldFrame.syntheticContentNodeId ===
                                                                    newFrame.syntheticContentNodeId;
                                                            });
                                                        if (!(frameOts.length ||
                                                            (!oldFrame || oldFrame.bounds !== newFrame.bounds))) return [3 /*break*/, 4];
                                                        oldDocument = (0, synthetic_1.getSyntheticDocumentByDependencyUri)(uri, prevState.documents, prevState.graph);
                                                        return [4 /*yield*/, (0, effects_1.spawn)(patchContainer, newFrame, (0, tandem_common_1.getNestedTreeNodeById)(newFrame.syntheticContentNodeId, oldDocument), frameOts)];
                                                    case 3:
                                                        _d.sent();
                                                        _d.label = 4;
                                                    case 4: return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _a = 0, _b = (0, edit_1.getSyntheticDocumentFrames)(newDocument, state.frames);
                                        _c.label = 4;
                                    case 4:
                                        if (!(_a < _b.length)) return [3 /*break*/, 7];
                                        newFrame = _b[_a];
                                        return [5 /*yield**/, _loop_1(newFrame)];
                                    case 5:
                                        _c.sent();
                                        _c.label = 6;
                                    case 6:
                                        _a++;
                                        return [3 /*break*/, 4];
                                    case 7:
                                        _i++;
                                        return [3 /*break*/, 3];
                                    case 8:
                                        marker.end();
                                        prevState = state;
                                        return [3 /*break*/, 0];
                                    case 9: return [2 /*return*/];
                                }
                            });
                        })];
                    case 1:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        function initContainer(frame, graph) {
            var container;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        container = createContainer();
                        // notify of the new container
                        return [4 /*yield*/, (0, effects_1.put)((0, actions_1.pcFrameContainerCreated)(frame, container))];
                    case 1:
                        // notify of the new container
                        _a.sent();
                        return [4 /*yield*/, (0, effects_1.call)(watchContainer, container, frame, graph)];
                    case 2:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        // FIXME: This produces memory leaks when frames are removed from the store.
        function watchContainer(container, frame) {
            var iframe, eventChan, eventType, state, contentNode, graph, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        iframe = container.children[0];
                        if (!iframe) {
                            return [2 /*return*/];
                        }
                        eventChan = (0, redux_saga_1.eventChannel)(function (emit) {
                            var onUnload = function () {
                                iframe.contentWindow.removeEventListener("unload", onUnload);
                                resetContainer(container);
                                emit("unload");
                            };
                            var onDone = function () {
                                if (iframe.contentWindow) {
                                    iframe.contentWindow.addEventListener("unload", onUnload);
                                }
                                iframe.removeEventListener("load", onDone);
                                emit("load");
                            };
                            iframe.addEventListener("load", onDone);
                            if (iframe.contentDocument && iframe.contentDocument.body) {
                                setImmediate(onDone);
                            }
                            return function () { };
                        });
                        _a.label = 1;
                    case 1:
                        if (!1) return [3 /*break*/, 7];
                        return [4 /*yield*/, (0, effects_1.take)(eventChan)];
                    case 2:
                        eventType = _a.sent();
                        if (!(eventType === "load")) return [3 /*break*/, 5];
                        return [4 /*yield*/, (0, effects_1.select)()];
                    case 3:
                        state = _a.sent();
                        contentNode = (0, synthetic_1.getSyntheticNodeById)(frame.syntheticContentNodeId, state.documents);
                        graph = state.graph;
                        // happens on reload
                        if (!iframe.contentDocument) {
                            return [3 /*break*/, 1];
                        }
                        body = iframe.contentDocument.body;
                        return [4 /*yield*/, (0, effects_1.put)((0, actions_1.pcFrameRendered)(frame, (0, dom_renderer_1.computeDisplayInfo)((frameNodeMap[frame.syntheticContentNodeId] = (0, dom_renderer_1.renderDOM)(body, contentNode)))))];
                    case 4:
                        _a.sent();
                        return [3 /*break*/, 6];
                    case 5:
                        if (eventType === "unload") {
                            return [3 /*break*/, 7];
                        }
                        _a.label = 6;
                    case 6: return [3 /*break*/, 1];
                    case 7: return [4 /*yield*/, (0, effects_1.call)(watchContainer, container, frame)];
                    case 8:
                        _a.sent();
                        return [2 /*return*/];
                }
            });
        }
        function patchContainer(frame, contentNode, ots) {
            var marker, container, iframe, body;
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        marker = (0, tandem_common_1.pmark)("*patchContainer()");
                        container = frame.$container;
                        iframe = container.children[0];
                        body = iframe.contentDocument && iframe.contentDocument.body;
                        if (!body) {
                            marker.end();
                            return [2 /*return*/];
                        }
                        frameNodeMap[frame.syntheticContentNodeId] = (0, dom_renderer_1.patchDOM)(ots, contentNode, body, frameNodeMap[frame.syntheticContentNodeId]);
                        return [4 /*yield*/, (0, effects_1.put)((0, actions_1.pcFrameRendered)(frame, (0, dom_renderer_1.computeDisplayInfo)(frameNodeMap[frame.syntheticContentNodeId])))];
                    case 1:
                        _a.sent();
                        marker.end();
                        return [2 /*return*/];
                }
            });
        }
        var initedFrames, mapContentNodeOperationalTransforms, frameNodeMap;
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, effects_1.fork)(runtime)];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, effects_1.fork)(nativeRenderer)];
                case 2:
                    _a.sent();
                    initedFrames = {};
                    mapContentNodeOperationalTransforms = function (syntheticContentNodeId, document, ots) {
                        var index = document.children.findIndex(function (child) { return child.id === syntheticContentNodeId; });
                        return ots.filter(function (ot) { return ot.nodePath[0] === index; }).map(function (ot) { return (__assign(__assign({}, ot), { nodePath: ot.nodePath.slice(1) })); });
                    };
                    frameNodeMap = {};
                    return [2 /*return*/];
            }
        });
    };
};
exports.createPaperclipSaga = createPaperclipSaga;
var createContainer = function () {
    if (typeof window === "undefined")
        return null;
    var container = document.createElement("div");
    container.appendChild(createIframe());
    return container;
};
var resetContainer = function (container) {
    container.removeChild(container.children[0]);
    container.appendChild(createIframe());
};
var createIframe = function () {
    var iframe = document.createElement("iframe");
    iframe.style.width = "100%";
    iframe.style.height = "100%";
    iframe.style.background = "white";
    iframe.addEventListener("load", function () {
        iframe.contentDocument.body.style.margin = "0";
    });
    return iframe;
};
//# sourceMappingURL=saga.js.map