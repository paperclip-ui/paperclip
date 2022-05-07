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
exports.addFileCacheItemToDependencyGraph = exports.isPaperclipUri = exports.getModifiedDependencies = exports.updateGraphDependency = exports.getDependents = void 0;
var tandem_common_1 = require("tandem-common");
var migratePCModule = require("paperclip-migrator");
var dsl_1 = require("./dsl");
/*------------------------------------------
 * GETTERS
 *-----------------------------------------*/
exports.getDependents = (0, tandem_common_1.memoize)(function (uri, graph) {
    var dependents = [];
    for (var depUri in graph) {
        if (depUri === uri) {
            continue;
        }
        var dep = graph[depUri];
    }
    return dependents;
});
var updateGraphDependency = function (properties, uri, graph) {
    var _a;
    return (__assign(__assign({}, graph), (_a = {}, _a[uri] = __assign(__assign({}, graph[uri]), properties), _a)));
};
exports.updateGraphDependency = updateGraphDependency;
var getModifiedDependencies = function (newGraph, oldGraph) {
    var modified = [];
    for (var uri in oldGraph) {
        if (newGraph[uri] && newGraph[uri].content !== oldGraph[uri].content) {
            modified.push(newGraph[uri]);
        }
    }
    return modified;
};
exports.getModifiedDependencies = getModifiedDependencies;
var isPaperclipUri = function (uri) {
    return /\.pc$/.test(uri);
};
exports.isPaperclipUri = isPaperclipUri;
var createDependencyFromFileCacheItem = (0, tandem_common_1.memoize)(function (_a) {
    var uri = _a.uri, content = _a.content;
    var source = content.toString("utf8");
    return {
        uri: uri,
        // if an empty string, then it's a new file.
        content: source.trim() === ""
            ? (0, dsl_1.createPCModule)()
            : migratePCModule(JSON.parse(source))
    };
});
var addFileCacheItemToDependencyGraph = function (item, graph) {
    var _a;
    if (graph === void 0) { graph = {}; }
    return __assign(__assign({}, graph), (_a = {}, _a[item.uri] = createDependencyFromFileCacheItem(item), _a));
};
exports.addFileCacheItemToDependencyGraph = addFileCacheItemToDependencyGraph;
/*------------------------------------------
 * SETTERS
 *-----------------------------------------*/
//# sourceMappingURL=graph.js.map