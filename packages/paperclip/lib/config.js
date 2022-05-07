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
exports.loadFSDependencyGraphSync = exports.walkPCRootDirectory = exports.findPaperclipSourceFiles = exports.openPCConfig = exports.DEFAULT_CONFIG = exports.createPCConfig = void 0;
var fs = require("fs");
var path = require("path");
var dsl_1 = require("./dsl");
var graph_1 = require("./graph");
var constants_1 = require("./constants");
var tandem_common_1 = require("tandem-common");
var DEFAULT_EXCLUDES = ["node_modules"];
var createPCConfig = function (rootDir, exclude) {
    if (exclude === void 0) { exclude = DEFAULT_EXCLUDES; }
    return ({
        rootDir: rootDir,
        exclude: exclude
    });
};
exports.createPCConfig = createPCConfig;
exports.DEFAULT_CONFIG = (0, exports.createPCConfig)(".");
var openPCConfig = function (dir) {
    var cdir = dir;
    while (1) {
        var possibleDir = (cdir = path.dirname(cdir));
        if (!cdir) {
            break;
        }
        var tdProjectBasename = fs
            .readdirSync(possibleDir)
            .find(function (name) { return name.indexOf(constants_1.PAPERCLIP_CONFIG_DEFAULT_EXTENSION) !== -1; });
        if (tdProjectBasename) {
            return {
                directory: (0, tandem_common_1.normalizeFilePath)(possibleDir),
                config: JSON.parse(fs.readFileSync(path.join(possibleDir, tdProjectBasename), "utf8"))
            };
        }
    }
    return { directory: dir, config: exports.DEFAULT_CONFIG };
};
exports.openPCConfig = openPCConfig;
var findPaperclipSourceFiles = function (config, cwd) {
    var pcFilePaths = [];
    (0, exports.walkPCRootDirectory)(config, cwd, function (filePath) {
        if ((0, graph_1.isPaperclipUri)(filePath)) {
            pcFilePaths.push(filePath);
        }
    });
    return pcFilePaths;
};
exports.findPaperclipSourceFiles = findPaperclipSourceFiles;
var walkPCRootDirectory = function (_a, cwd, each) {
    var rootDir = _a.rootDir, exclude = _a.exclude;
    var excludeRegexp = new RegExp(exclude.join("|"));
    var pcFilePaths = [];
    if (rootDir.charAt(0) === ".") {
        rootDir = path.resolve(cwd, rootDir);
    }
    walkFiles(rootDir, function (filePath, isDirectory) {
        if (excludeRegexp.test(filePath)) {
            return false;
        }
        each(filePath, isDirectory);
    });
};
exports.walkPCRootDirectory = walkPCRootDirectory;
var walkFiles = function (filePath, each) {
    var isDirectory = fs.lstatSync(filePath).isDirectory();
    if (each(filePath, isDirectory) === false) {
        return;
    }
    if (!isDirectory) {
        return;
    }
    var subpaths = fs
        .readdirSync(filePath)
        .map(function (basename) { return (0, tandem_common_1.normalizeFilePath)(path.join(filePath, basename)); });
    for (var i = 0, length_1 = subpaths.length; i < length_1; i++) {
        walkFiles(subpaths[i], each);
    }
};
var loadFSDependencyGraphSync = function (config, cwd, mapModule) {
    return (0, exports.findPaperclipSourceFiles)(config, cwd).reduce(function (config, sourceFilePath) {
        var _a;
        var uri = (0, tandem_common_1.addProtocol)(tandem_common_1.FILE_PROTOCOL, sourceFilePath);
        var content = fs.readFileSync(sourceFilePath, "utf8") || "{}";
        return __assign(__assign({}, config), (_a = {}, _a[uri] = (0, dsl_1.createPCDependency)(uri, mapModule(JSON.parse(content))), _a));
    }, {});
};
exports.loadFSDependencyGraphSync = loadFSDependencyGraphSync;
//# sourceMappingURL=config.js.map