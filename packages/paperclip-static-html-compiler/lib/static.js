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
exports.translatePaperclipModuleToStaticHTML = void 0;
var fs = require("fs");
var fsa = require("fs-extra");
var path = require("path");
var paperclip_1 = require("paperclip");
var lodash_1 = require("lodash");
var html_compiler_1 = require("./html-compiler");
var bundler_1 = require("./bundler");
var crypto = require("crypto");
var stringifyStyleRuleValue = function (key, value, space, tab) {
    if (typeof value === "string") {
        return "".concat(space).concat(key, ": ").concat(value, ";\n");
    }
    return "".concat(space).concat(key, "{\n").concat(stringifyStyleRules(value, space + tab), "}\n");
};
var stringifyStyleRules = function (rules, space, tab) {
    if (space === void 0) { space = ""; }
    if (tab === void 0) { tab = "  "; }
    var buffer = [];
    var sortedKeys = Object.keys(rules).sort(function (a, b) {
        return a.indexOf("@media") !== -1 ? 1 : 0;
    });
    for (var _i = 0, sortedKeys_1 = sortedKeys; _i < sortedKeys_1.length; _i++) {
        var selector = sortedKeys_1[_i];
        buffer.push(stringifyStyleRuleValue(selector, rules[selector], space, tab));
    }
    return buffer.join("");
};
var translatePaperclipModuleToStaticHTML = function (config, cwd) {
    for (var _i = 0, _a = config.pages; _i < _a.length; _i++) {
        var page = _a[_i];
        translatePage(page, config, cwd);
    }
};
exports.translatePaperclipModuleToStaticHTML = translatePaperclipModuleToStaticHTML;
var translatePage = function (page, config, cwd) {
    var outputFile = config.outputDirectory
        ? resolvePath(path.join(config.outputDirectory, page.fileName), cwd)
        : resolvePath(page.fileName, cwd);
    var outputDir = path.dirname(outputFile);
    console.log("Creating ".concat(outputFile));
    var graph = (0, paperclip_1.loadFSDependencyGraphSync)(config.project, cwd, lodash_1.identity);
    graph = injectVaraibles(page.variables, graph);
    var component = page.component.id
        ? (0, paperclip_1.getPCNode)(page.component.id, graph)
        : page.component.name
            ? (0, paperclip_1.getAllPCComponents)(graph).find(function (component) { return component.label === page.component.name; })
            : null;
    if (!component) {
        console.error("Could not find component : ".concat(JSON.stringify(page.component), "."));
        return;
    }
    var componentDep = (0, paperclip_1.getPCNodeDependency)(component.id, graph);
    var bundle = (0, bundler_1.bundleDependencyGraph)(graph, cwd);
    var externalDepOutputFilePaths = {};
    var evaluatedModule = (0, bundler_1.evaluateBundle)(componentDep.uri, bundle, function (uri) {
        if (externalDepOutputFilePaths[uri]) {
            return externalDepOutputFilePaths[uri];
        }
        var outputPath = path.join(outputDir, crypto
            .createHash("md5")
            .update(uri)
            .digest("hex") + path.extname(uri));
        return path.relative(outputDir, (externalDepOutputFilePaths[uri] = outputPath));
    });
    var imp = evaluatedModule["_".concat(component.id)]({});
    var vnode = imp.renderer({});
    vnode = {
        id: "html",
        name: "html",
        attributes: {},
        children: [
            {
                id: "head",
                name: "head",
                attributes: {},
                children: [
                    {
                        id: "title",
                        name: "title",
                        children: [page.title]
                    },
                    {
                        id: "meta-utf8",
                        name: "meta",
                        attributes: {
                            charset: "utf-8"
                        },
                        children: []
                    },
                    {
                        id: "meta-viewport",
                        name: "meta",
                        attributes: {
                            name: "viewport",
                            content: "width=device-width, initial-scale=1.0"
                        },
                        children: []
                    },
                    {
                        id: "main-style",
                        name: "style",
                        attributes: {
                            type: "text/css"
                        },
                        children: [
                            "html, body {\n              margin: 0;\n              padding: 0;\n            }" + stringifyStyleRules(imp.styleRules)
                        ]
                    }
                ]
            },
            {
                id: "body",
                name: "body",
                attributes: {},
                children: [vnode]
            }
        ]
    };
    var html = (0, html_compiler_1.stringifyVirtualNode)(vnode);
    try {
        fsa.mkdirpSync(path.dirname(outputFile));
    }
    catch (e) { }
    fs.writeFileSync(outputFile, html);
    for (var sourceFilePath in externalDepOutputFilePaths) {
        fsa.copyFileSync(sourceFilePath, externalDepOutputFilePaths[sourceFilePath]);
    }
};
var injectVaraibles = function (injections, graph) {
    var variables = (0, paperclip_1.getGlobalVariables)(graph);
    var _loop_1 = function (labelOrId) {
        var variable = ((0, paperclip_1.getPCNode)(labelOrId, graph) ||
            variables.find(function (variable) { return variable.label === labelOrId; }));
        if (!variable) {
            console.error("Variable ".concat(labelOrId, " does not exist."));
            return "continue";
        }
        variable = __assign(__assign({}, variable), { value: injections[labelOrId] });
        graph = (0, paperclip_1.replacePCNode)(variable, variable, graph);
    };
    for (var labelOrId in injections) {
        _loop_1(labelOrId);
    }
    return graph;
};
function resolvePath(relPath, cwd) {
    return relPath.charAt(0) === "/" ? relPath : path.join(cwd, relPath);
}
//# sourceMappingURL=static.js.map