"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
var paperclip_react_compiler_1 = require("paperclip-react-compiler");
var migrate = require("paperclip-migrator");
var paperclip_1 = require("paperclip");
var tandem_common_1 = require("tandem-common");
var loaderUtils = require("loader-utils");
// TODO - use options for
module.exports = function (source) {
    var _this = this;
    this.cacheable && this.cacheable();
    var callback = this.async();
    var uri = tandem_common_1.normalizeFilePath(this.resource);
    var options = loaderUtils.getOptions(this) || {};
    var useHMR = options.hmr == null ? true : options.hmr;
    var graph = paperclip_1.loadFSDependencyGraphSync(options.config, process.cwd(), migrate);
    var entry = graph["file://" + uri];
    var content = paperclip_react_compiler_1.translatePaperclipModuleToReact(entry, graph, process.cwd())
        .buffer;
    var refMap = paperclip_1.getComponentGraphRefMap(entry.content, graph);
    var depUriMap = {};
    for (var refId in refMap) {
        var ref = paperclip_1.getPCNodeDependency(refId, graph);
        depUriMap[ref.uri] = 1;
    }
    Object.keys(depUriMap).forEach(function (uri) {
        _this.addDependency(uri.replace("file://", ""));
    });
    if (useHMR) {
        content +=
            "\n" +
                "if (module.hot) {\n" +
                "  module.hot.accept(function() { window.reload(); });" +
                "}";
    }
    callback(null, content);
};
//# sourceMappingURL=index.js.map