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
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.sortFSItems = exports.updateFSItemAlts = exports.mergeFSItems = exports.convertFlatFilesToNested2 = exports.convertFlatFilesToNested = exports.getFilesWithExtension = exports.getFileFromUri = exports.getFilePathFromNodePath = exports.getFilePath = exports.createDirectory = exports.createFile = exports.isDirectory = exports.isFile = exports.FileAttributeNames = exports.FSItemTagNames = exports.FSItemNamespaces = void 0;
var tree_1 = require("./tree");
var memoization_1 = require("../utils/memoization");
var path = require("path");
var uid_1 = require("../utils/uid");
var lodash_1 = require("lodash");
var protocol_1 = require("../utils/protocol");
var __1 = require("..");
var FSItemNamespaces;
(function (FSItemNamespaces) {
    FSItemNamespaces["CORE"] = "core";
})(FSItemNamespaces = exports.FSItemNamespaces || (exports.FSItemNamespaces = {}));
var FSItemTagNames;
(function (FSItemTagNames) {
    FSItemTagNames["FILE"] = "file";
    FSItemTagNames["DIRECTORY"] = "directory";
})(FSItemTagNames = exports.FSItemTagNames || (exports.FSItemTagNames = {}));
var FileAttributeNames;
(function (FileAttributeNames) {
    FileAttributeNames["URI"] = "uri";
    FileAttributeNames["EXPANDED"] = "expanded";
    FileAttributeNames["BASENAME"] = "basename";
    FileAttributeNames["SELECTED"] = "selected";
})(FileAttributeNames = exports.FileAttributeNames || (exports.FileAttributeNames = {}));
var isFile = function (node) {
    return node.name === FSItemTagNames.FILE;
};
exports.isFile = isFile;
var isDirectory = function (node) {
    return node.name === FSItemTagNames.DIRECTORY;
};
exports.isDirectory = isDirectory;
var createFile = function (uri) { return ({
    id: (0, uid_1.generateUID)(),
    name: FSItemTagNames.FILE,
    uri: uri,
    children: []
}); };
exports.createFile = createFile;
var createDirectory = function (uri, children, expanded) {
    if (children === void 0) { children = []; }
    return ({
        id: (0, uid_1.generateUID)(),
        name: FSItemTagNames.DIRECTORY,
        expanded: expanded,
        uri: uri,
        children: children || []
    });
};
exports.createDirectory = createDirectory;
var getFileName = function (current) { return path.basename(current.uri); };
exports.getFilePath = (0, memoization_1.memoize)(function (file, directory) {
    var childParentMap = (0, tree_1.getChildParentMap)(directory);
    var path = [];
    var current = file;
    while (current) {
        path.unshift(getFileName(current));
        current = childParentMap[current.id];
    }
    return path.join("/");
});
var getFilePathFromNodePath = function (path, directory) {
    return (0, exports.getFilePath)((0, tree_1.getTreeNodeFromPath)(path, directory), directory);
};
exports.getFilePathFromNodePath = getFilePathFromNodePath;
var getFileFromUri = function (uri, root) {
    return (0, tree_1.findNestedNode)(root, function (child) { return child.uri === uri; });
};
exports.getFileFromUri = getFileFromUri;
exports.getFilesWithExtension = (0, memoization_1.memoize)(function (extension, directory) {
    var tester = new RegExp("".concat(extension, "$"));
    return (0, tree_1.filterNestedNodes)(directory, function (file) { return (0, exports.isFile)(file) && tester.test(getFileName(file)); });
});
var convertFlatFilesToNested = function (files) {
    var splitParts = files.map(function (_a) {
        var filePath = _a[0], isDirectory = _a[1];
        return [filePath.split(/[\\/]/), isDirectory];
    });
    var sortedFiles = splitParts
        .sort(function (a, b) {
        var ap = a[0], aid = a[1];
        var bp = b[0], bid = b[1];
        if (ap.length > bp.length) {
            return -1;
        }
        else if (ap.length < bp.length) {
            return 1;
        }
        // same length, just check if it's a directory
        return aid ? 1 : -1;
    })
        .map(function (_a) {
        var parts = _a[0], isDirectory = _a[1];
        return [parts.join("/"), isDirectory];
    });
    var pool = {};
    var highest;
    var highestDirname;
    for (var _i = 0, sortedFiles_1 = sortedFiles; _i < sortedFiles_1.length; _i++) {
        var _a = sortedFiles_1[_i], filePath = _a[0], isDirectory_1 = _a[1];
        var uri = (0, protocol_1.addProtocol)(protocol_1.FILE_PROTOCOL, filePath);
        if (isDirectory_1) {
            highest = (0, exports.createDirectory)(uri, (0, exports.sortFSItems)(pool[uri] || __1.EMPTY_ARRAY));
        }
        else {
            highest = (0, exports.createFile)(uri);
        }
        highestDirname = path.dirname(uri);
        if (!pool[highestDirname]) {
            pool[highestDirname] = [];
        }
        pool[highestDirname].push(highest);
    }
    return (0, exports.sortFSItems)(pool[highestDirname]);
};
exports.convertFlatFilesToNested = convertFlatFilesToNested;
var convertFlatFilesToNested2 = function (items) {
    var splitParts = items.map(function (item) {
        return [
            (0, protocol_1.stripProtocol)(item.uri).split(/[\\/]/),
            item.name === FSItemTagNames.DIRECTORY,
            item
        ];
    });
    var sortedFiles = splitParts
        .sort(function (a, b) {
        var ap = a[0], aid = a[1];
        var bp = b[0], bid = b[1];
        if (ap.length > bp.length) {
            return -1;
        }
        else if (ap.length < bp.length) {
            return 1;
        }
        // same length, just check if it's a directory
        return aid ? 1 : -1;
    })
        .map(function (_a) {
        var parts = _a[0], isDirectory = _a[1];
        return [parts.join("/"), isDirectory];
    });
    var pool = {};
    var highest;
    var highestDirname;
    for (var _i = 0, sortedFiles_2 = sortedFiles; _i < sortedFiles_2.length; _i++) {
        var _a = sortedFiles_2[_i], filePath = _a[0], isDirectory_2 = _a[1];
        var uri = (0, protocol_1.addProtocol)(protocol_1.FILE_PROTOCOL, filePath);
        if (isDirectory_2) {
            highest = (0, exports.createDirectory)(uri, (0, exports.sortFSItems)(pool[uri] || __1.EMPTY_ARRAY));
        }
        else {
            highest = (0, exports.createFile)(uri);
        }
        highestDirname = path.dirname(uri);
        if (!pool[highestDirname]) {
            pool[highestDirname] = [];
        }
        pool[highestDirname].push(highest);
    }
    var highestPool = pool[highestDirname];
    return (0, exports.updateFSItemAlts)(highestPool.length === 1 && highestPool[0].name === FSItemTagNames.DIRECTORY
        ? highestPool[0]
        : (0, exports.createDirectory)(highestDirname, (0, exports.sortFSItems)(highestPool), true));
};
exports.convertFlatFilesToNested2 = convertFlatFilesToNested2;
var mergeFSItems = function () {
    var items = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        items[_i] = arguments[_i];
    }
    var flattenedItems = (0, lodash_1.uniqBy)(items.reduce(function (allItems, item) {
        return __spreadArray(__spreadArray([], allItems, true), (0, tree_1.flattenTreeNode)(item), true);
    }, __1.EMPTY_ARRAY), function (item) { return item.uri; });
    var itemMap = {};
    for (var _a = 0, flattenedItems_1 = flattenedItems; _a < flattenedItems_1.length; _a++) {
        var item = flattenedItems_1[_a];
        itemMap[item.uri] = item;
    }
    var mapTree = function (node) {
        var existing = itemMap[node.uri];
        if (!existing) {
            return node;
        }
        if (node.name === FSItemTagNames.DIRECTORY) {
            return __assign(__assign(__assign({}, node), existing), { children: node.children.map(mapTree) });
        }
        else {
            return existing;
        }
    };
    return (0, exports.updateFSItemAlts)(mapTree((0, exports.convertFlatFilesToNested2)(flattenedItems)));
};
exports.mergeFSItems = mergeFSItems;
var updateFSItemAlts = function (root) {
    var flattened = (0, tree_1.flattenTreeNode)(root).filter(function (node) {
        return (0, tree_1.getParentTreeNode)(node.id, root) &&
            (0, tree_1.getParentTreeNode)(node.id, root).expanded;
    });
    var map = function (node) {
        var alt = flattened.indexOf(node) % 2 !== 0;
        var children = node.children;
        if (node.expanded) {
            children = node.children.map(map);
        }
        if (node.alt !== alt || node.children !== children) {
            return __assign(__assign({}, node), { alt: alt, children: children });
        }
        return node;
    };
    return map(root);
};
exports.updateFSItemAlts = updateFSItemAlts;
var sortFSItems = function (files) {
    return __spreadArray([], files, true).sort(function (a, b) {
        return a.name === FSItemTagNames.FILE && b.name === FSItemTagNames.DIRECTORY
            ? 1
            : a.name === FSItemTagNames.DIRECTORY && b.name === FSItemTagNames.FILE
                ? -1
                : a.uri < b.uri
                    ? -1
                    : 1;
    });
};
exports.sortFSItems = sortFSItems;
//# sourceMappingURL=file.js.map