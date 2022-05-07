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
exports.evaluateBundle = exports.bundleDependencyGraph = void 0;
var path = require("path");
var html_compiler_1 = require("./html-compiler");
var tandem_common_1 = require("tandem-common");
exports.bundleDependencyGraph = function (graph, rootDirectory) {
    var bundle = {};
    for (var uri in graph) {
        bundle = addDependencyToBundle(uri, bundle, graph, rootDirectory);
    }
    return bundle;
};
var addDependencyToBundle = function (uri, bundle, graph, rootDirectory) {
    var _a, _b;
    var filePath = tandem_common_1.stripProtocol(uri);
    if (bundle[filePath]) {
        return bundle;
    }
    // define now to avoid circular deps
    bundle = __assign(__assign({}, bundle), (_a = {}, _a[filePath] = {
        imports: tandem_common_1.EMPTY_OBJECT,
        module: null
    }, _a));
    // PC module
    if (graph[uri]) {
        var entry = graph[uri];
        var content = html_compiler_1.translatePaperclipModuleToHTMLRenderers(entry, graph, rootDirectory).buffer;
        var imports = (content.match(/require\(.*?\)/g) || tandem_common_1.EMPTY_ARRAY).map(function (req) {
            return req.match(/require\(["'](.*?)["']\)/)[1];
        });
        var resolvedImports = {};
        for (var _i = 0, imports_1 = imports; _i < imports_1.length; _i++) {
            var relativePath = imports_1[_i];
            var fullPath = path.resolve(path.dirname(tandem_common_1.stripProtocol(entry.uri)), relativePath);
            resolvedImports[relativePath] = fullPath;
            bundle = addDependencyToBundle(fullPath, bundle, graph, rootDirectory);
        }
        var module = new Function("require", "module", "exports", content);
        return __assign(__assign({}, bundle), (_b = {}, _b[filePath] = {
            imports: resolvedImports,
            module: module
        }, _b));
    }
    else {
    }
    return bundle;
};
exports.evaluateBundle = function (entryPath, bundle, resolveExternal) {
    var imported = {};
    var require = function (filePath) {
        if (imported[filePath]) {
            return imported[filePath].exports;
        }
        var module = (imported[filePath] = {
            exports: {}
        });
        var dep = bundle[filePath];
        if (!dep.module) {
            module.exports = resolveExternal(filePath);
        }
        else {
            dep.module(function (relativePath) {
                var fullPath = dep.imports[relativePath];
                return require(fullPath);
            }, module, module.exports);
        }
        return module.exports;
    };
    return require(tandem_common_1.stripProtocol(entryPath));
};
//# sourceMappingURL=bundler.js.map