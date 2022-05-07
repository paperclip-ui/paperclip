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
Object.defineProperty(exports, "__esModule", { value: true });
exports.paperclipReducer = void 0;
var fsbox_1 = require("fsbox");
var actions_1 = require("./actions");
var edit_1 = require("./edit");
var graph_1 = require("./graph");
var constants_1 = require("./constants");
// import { FILE_CHANGED, FileChanged, FileChangedEventType } from "index";
var paperclipReducer = function (state, action) {
    switch (action.type) {
        case actions_1.PC_SYNTHETIC_FRAME_CONTAINER_CREATED: {
            var _a = action, frame = _a.frame, $container = _a.$container;
            return (0, edit_1.updateFrame)({
                $container: $container,
                computed: null
            }, frame, state);
        }
        case actions_1.PC_RUNTIME_EVALUATED: {
            var _b = action, allDocuments = _b.allDocuments, catchingUp = _b.catchingUp;
            if (catchingUp) {
                return state;
            }
            return (0, edit_1.upsertFrames)(__assign(__assign({}, Object(state)), { documents: allDocuments }));
        }
        case actions_1.PC_SOURCE_FILE_URIS_RECEIVED: {
            var uris = action.uris;
            state = (0, fsbox_1.queueOpenFiles)(uris, state);
            return pruneDependencyGraph(state);
        }
        case actions_1.PC_SYNTHETIC_FRAME_RENDERED: {
            var _c = action, frame = _c.frame, computed = _c.computed;
            return (0, edit_1.updateFrame)({
                computed: computed
            }, frame, state);
        }
        // ick, this needs to be strongly typed and pulled fron fsbox. Currently
        // living in front-end
        case fsbox_1.FILE_CHANGED: {
            var _d = action, uri = _d.uri, eventType = _d.eventType;
            if ((0, graph_1.isPaperclipUri)(uri)) {
                if (eventType === fsbox_1.FileChangedEventType.UNLINK) {
                    var newGraph = __assign({}, state.graph);
                    delete newGraph[uri];
                    state = __assign(__assign({}, state), { graph: newGraph });
                }
                else if (eventType === fsbox_1.FileChangedEventType.ADD) {
                    state = (0, fsbox_1.queueOpenFile)(uri, state);
                }
            }
            return state;
        }
        case fsbox_1.FS_SANDBOX_ITEM_LOADED: {
            var _e = action, uri = _e.uri, content = _e.content, mimeType = _e.mimeType;
            // dependency graph can only load files that are within the scope of the project via PC_SOURCE_FILE_URIS_RECEIVED
            if (mimeType !== constants_1.PAPERCLIP_MIME_TYPE) {
                return state;
            }
            var graph = (0, graph_1.addFileCacheItemToDependencyGraph)({ uri: uri, content: content }, state.graph);
            state = pruneDependencyGraph(__assign(__assign({}, state), { graph: graph }));
            return state;
        }
    }
    return state;
};
exports.paperclipReducer = paperclipReducer;
var pruneDependencyGraph = function (state) {
    var graph = state.graph;
    var fullyLoaded = true;
    for (var uri in state.fileCache) {
        if ((0, graph_1.isPaperclipUri)(uri) && !graph[uri]) {
            fullyLoaded = false;
        }
    }
    // prune old deps
    if (fullyLoaded) {
        var newGraph = void 0;
        for (var uri in graph) {
            if (!state.fileCache[uri]) {
                if (!newGraph) {
                    newGraph = __assign({}, graph);
                }
                delete newGraph[uri];
            }
        }
        if (newGraph) {
            return __assign(__assign({}, state), { graph: newGraph });
        }
    }
    return state;
};
//# sourceMappingURL=reducer.js.map