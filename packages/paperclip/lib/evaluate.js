"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.evaluateDependencyGraph = void 0;
var tandem_common_1 = require("tandem-common");
var dsl_1 = require("./dsl");
var vanilla_compiler_1 = require("./vanilla-compiler");
var synthetic_1 = require("./synthetic");
var reuseNodeGraphMap = (0, tandem_common_1.reuser)(500, function (value) {
    return Object.keys(value).join(",");
});
var evaluateDependencyGraph = function (graph, rootDirectory, variants, uriWhitelist) {
    var documents = {};
    var renderers = compileDependencyGraph(graph, rootDirectory);
    for (var uri in graph) {
        if (uriWhitelist && uriWhitelist.indexOf(uri) === -1) {
            continue;
        }
        var module_1 = graph[uri].content;
        documents[uri] = evaluateModule(module_1, variants, reuseNodeGraphMap(filterAssocRenderers(module_1, graph, renderers)));
    }
    return documents;
};
exports.evaluateDependencyGraph = evaluateDependencyGraph;
var evaluateModule = (0, tandem_common_1.memoize)(function (module, variants, usedRenderers) {
    return (0, synthetic_1.createSytheticDocument)(module.id, module.children
        .filter(function (child) {
        return child.name !== dsl_1.PCSourceTagNames.VARIABLE &&
            child.name !== dsl_1.PCSourceTagNames.QUERY;
    })
        .map(function (child) {
        return usedRenderers["_".concat(child.id)](child.id, null, tandem_common_1.EMPTY_OBJECT, tandem_common_1.EMPTY_OBJECT, variants[child.id] || tandem_common_1.EMPTY_OBJECT, tandem_common_1.EMPTY_OBJECT, getWindowInfo(child), usedRenderers, true);
    }));
});
var getWindowInfo = function (contentNode) {
    var bounds = contentNode.metadata[dsl_1.PCVisibleNodeMetadataKey.BOUNDS];
    return {
        width: Math.round(bounds.right - bounds.left),
        height: Math.round(bounds.bottom - bounds.top)
    };
};
var filterAssocRenderers = function (module, graph, allRenderers) {
    var assocRenderers = {};
    var refMap = (0, dsl_1.getComponentGraphRefMap)(module, graph);
    for (var id in refMap) {
        assocRenderers["_".concat(id)] = allRenderers["_".concat(id)];
    }
    for (var _i = 0, _a = module.children; _i < _a.length; _i++) {
        var child = _a[_i];
        assocRenderers["_".concat(child.id)] = allRenderers["_".concat(child.id)];
    }
    return assocRenderers;
};
var compileDependencyGraph = (0, tandem_common_1.memoize)(function (graph, rootDirectory) {
    var renderers = {};
    for (var uri in graph) {
        var module_2 = graph[uri].content;
        for (var _i = 0, _a = module_2.children; _i < _a.length; _i++) {
            var contentNode = _a[_i];
            renderers["_".concat(contentNode.id)] = (0, vanilla_compiler_1.compileContentNodeAsVanilla)(contentNode, reuseNodeGraphMap((0, dsl_1.getComponentGraphRefMap)(contentNode, graph)), reuseNodeGraphMap((0, dsl_1.getVariableRefMap)(contentNode, graph)), reuseNodeGraphMap((0, dsl_1.getQueryRefMap)(contentNode, graph)), uri, rootDirectory);
        }
    }
    return renderers;
});
//# sourceMappingURL=evaluate.js.map