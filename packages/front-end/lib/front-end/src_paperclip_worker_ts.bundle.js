(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(self, () => {
return /******/ (() => { // webpackBootstrap
/******/ 	var __webpack_modules__ = ({

/***/ "./src/paperclip.worker.ts":
/*!*********************************!*\
  !*** ./src/paperclip.worker.ts ***!
  \*********************************/
/***/ ((__unused_webpack_module, __webpack_exports__, __webpack_require__) => {

"use strict";
__webpack_require__.r(__webpack_exports__);
/* harmony import */ var paperclip__WEBPACK_IMPORTED_MODULE_0__ = __webpack_require__(/*! paperclip */ "../paperclip/index.js");
/* harmony import */ var paperclip__WEBPACK_IMPORTED_MODULE_0___default = /*#__PURE__*/__webpack_require__.n(paperclip__WEBPACK_IMPORTED_MODULE_0__);

(0,paperclip__WEBPACK_IMPORTED_MODULE_0__.hookRemotePCRuntime)((0,paperclip__WEBPACK_IMPORTED_MODULE_0__.createLocalPCRuntime)(), self);


/***/ }),

/***/ "../common/index.js":
/*!**************************!*\
  !*** ../common/index.js ***!
  \**************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib */ "../common/lib/index.js");


/***/ }),

/***/ "../common/lib/index.js":
/*!******************************!*\
  !*** ../common/lib/index.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./redux */ "../common/lib/redux/index.js"), exports);
__exportStar(__webpack_require__(/*! ./state */ "../common/lib/state/index.js"), exports);
__exportStar(__webpack_require__(/*! ./utils */ "../common/lib/utils/index.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../common/lib/redux/actions.js":
/*!**************************************!*\
  !*** ../common/lib/redux/actions.js ***!
  \**************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.publicActionCreator = exports.isPublicAction = void 0;
var isPublicAction = function (action) { return action["@@public"] === true; };
exports.isPublicAction = isPublicAction;
var publicActionCreator = function (createAction) {
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var action = createAction.apply(void 0, args);
        action["@@public"] = true;
        return action;
    });
};
exports.publicActionCreator = publicActionCreator;
//# sourceMappingURL=actions.js.map

/***/ }),

/***/ "../common/lib/redux/index.js":
/*!************************************!*\
  !*** ../common/lib/redux/index.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./actions */ "../common/lib/redux/actions.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../common/lib/state/file.js":
/*!***********************************!*\
  !*** ../common/lib/state/file.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.sortFSItems = exports.updateFSItemAlts = exports.mergeFSItems = exports.convertFlatFilesToNested2 = exports.convertFlatFilesToNested = exports.getFilesWithExtension = exports.getFileFromUri = exports.getFilePathFromNodePath = exports.getFilePath = exports.createDirectory = exports.createFile = exports.isDirectory = exports.isFile = exports.FileAttributeNames = exports.FSItemTagNames = exports.FSItemNamespaces = void 0;
console.log("TS", typeof process);
var tree_1 = __webpack_require__(/*! ./tree */ "../common/lib/state/tree.js");
var memoization_1 = __webpack_require__(/*! ../utils/memoization */ "../common/lib/utils/memoization.js");
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var uid_1 = __webpack_require__(/*! ../utils/uid */ "../common/lib/utils/uid.js");
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var protocol_1 = __webpack_require__(/*! ../utils/protocol */ "../common/lib/utils/protocol.js");
var __1 = __webpack_require__(/*! .. */ "../common/lib/index.js");
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

/***/ }),

/***/ "../common/lib/state/geom.js":
/*!***********************************!*\
  !*** ../common/lib/state/geom.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getSmallestBounds = exports.pointIntersectsBounds = exports.boundsIntersect = exports.centerTransformZoom = exports.mergeBounds = exports.filterBounded = exports.isBounds = exports.scaleInnerBounds = exports.getBoundsPoint = exports.getBoundsSize = exports.getBoundsHeight = exports.getBoundsWidth = exports.boundsFromRect = exports.zoomPoint = exports.zoomBounds = exports.keepBoundsCenter = exports.keepBoundsAspectRatio = exports.pointToBounds = exports.flipPoint = exports.resizeBounds = exports.shiftBounds = exports.shiftPoint = exports.createZeroBounds = exports.roundBounds = exports.mapBounds = exports.moveBounds = exports.createBounds = void 0;
// import { getV } from "../struct";
var memoization_1 = __webpack_require__(/*! ../utils/memoization */ "../common/lib/utils/memoization.js");
var createBounds = function (left, right, top, bottom) { return ({
    left: left,
    right: right,
    top: top,
    bottom: bottom
}); };
exports.createBounds = createBounds;
var moveBounds = function (bounds, _a) {
    var left = _a.left, top = _a.top;
    return (__assign(__assign({}, bounds), { left: left, top: top, right: left + bounds.right - bounds.left, bottom: top + bounds.bottom - bounds.top }));
};
exports.moveBounds = moveBounds;
var mapBounds = function (bounds, map) { return (__assign(__assign({}, bounds), { left: map(bounds.left, "left"), right: map(bounds.right, "right"), top: map(bounds.top, "top"), bottom: map(bounds.bottom, "bottom") })); };
exports.mapBounds = mapBounds;
var roundBounds = function (bounds) {
    return (0, exports.mapBounds)(bounds, function (v) { return Math.round(v); });
};
exports.roundBounds = roundBounds;
var createZeroBounds = function () { return (0, exports.createBounds)(0, 0, 0, 0); };
exports.createZeroBounds = createZeroBounds;
var shiftPoint = function (point, delta) { return ({
    left: point.left + delta.left,
    top: point.top + delta.top
}); };
exports.shiftPoint = shiftPoint;
var shiftBounds = function (bounds, _a) {
    var left = _a.left, top = _a.top;
    return (__assign(__assign({}, bounds), { left: bounds.left + left, top: bounds.top + top, right: bounds.right + left, bottom: bounds.bottom + top }));
};
exports.shiftBounds = shiftBounds;
var resizeBounds = function (bounds, _a) {
    var width = _a.width, height = _a.height;
    return (__assign(__assign({}, bounds), { left: bounds.left, top: bounds.top, right: bounds.left + width, bottom: bounds.top + height }));
};
exports.resizeBounds = resizeBounds;
var flipPoint = function (point) { return ({
    left: -point.left,
    top: -point.top
}); };
exports.flipPoint = flipPoint;
var pointToBounds = function (point) { return ({
    left: point.left,
    top: point.top,
    right: point.left,
    bottom: point.top
}); };
exports.pointToBounds = pointToBounds;
var keepBoundsAspectRatio = function (newBounds, oldBounds, anchor, centerPoint) {
    if (centerPoint === void 0) { centerPoint = anchor; }
    var newBoundsSize = (0, exports.getBoundsSize)(newBounds);
    var oldBoundsSize = (0, exports.getBoundsSize)(oldBounds);
    var left = newBounds.left;
    var top = newBounds.top;
    var width = newBoundsSize.width;
    var height = newBoundsSize.height;
    if (anchor.top === 0 || anchor.top === 1) {
        var perc = height / oldBoundsSize.height;
        width = oldBoundsSize.width * perc;
        left =
            oldBounds.left + (oldBoundsSize.width - width) * (1 - centerPoint.left);
    }
    else if (anchor.top === 0.5) {
        var perc = width / oldBoundsSize.width;
        height = oldBoundsSize.height * perc;
        top =
            oldBounds.top + (oldBoundsSize.height - height) * (1 - centerPoint.top);
    }
    return {
        left: left,
        top: top,
        right: left + width,
        bottom: top + height
    };
};
exports.keepBoundsAspectRatio = keepBoundsAspectRatio;
var keepBoundsCenter = function (newBounds, oldBounds, anchor) {
    var newBoundsSize = (0, exports.getBoundsSize)(newBounds);
    var oldBoundsSize = (0, exports.getBoundsSize)(oldBounds);
    var left = oldBounds.left;
    var top = oldBounds.top;
    var width = oldBoundsSize.width;
    var height = oldBoundsSize.height;
    var delta = {
        left: newBounds.left - oldBounds.left,
        top: newBounds.top - oldBounds.top
    };
    if (anchor.top === 0) {
        top += delta.top;
        height += delta.top;
        height = oldBounds.top - newBounds.top;
    }
    if (anchor.top === 1) {
        var hdiff = oldBoundsSize.height - newBoundsSize.height;
        top += hdiff;
        height -= hdiff;
    }
    if (anchor.left === 0) {
        left += delta.left;
        top += delta.top;
        width += oldBounds.left - newBounds.left;
    }
    if (anchor.left === 1) {
        width += delta.left;
        var wdiff = oldBoundsSize.width - newBoundsSize.width;
        left += wdiff;
        width -= wdiff;
    }
    return {
        left: left,
        top: top,
        right: left + width,
        bottom: top + height
    };
};
exports.keepBoundsCenter = keepBoundsCenter;
var zoomBounds = function (bounds, zoom) { return (__assign(__assign({}, bounds), { left: bounds.left * zoom, top: bounds.top * zoom, right: bounds.right * zoom, bottom: bounds.bottom * zoom })); };
exports.zoomBounds = zoomBounds;
var zoomPoint = function (point, zoom) { return (__assign(__assign({}, point), { left: point.left * zoom, top: point.top * zoom })); };
exports.zoomPoint = zoomPoint;
var boundsFromRect = function (_a) {
    var width = _a.width, height = _a.height;
    return ({
        left: 0,
        top: 0,
        right: width,
        bottom: height
    });
};
exports.boundsFromRect = boundsFromRect;
var getBoundsWidth = function (bounds) { return bounds.right - bounds.left; };
exports.getBoundsWidth = getBoundsWidth;
var getBoundsHeight = function (bounds) { return bounds.bottom - bounds.top; };
exports.getBoundsHeight = getBoundsHeight;
exports.getBoundsSize = (0, memoization_1.memoize)(function (bounds) { return ({
    width: (0, exports.getBoundsWidth)(bounds),
    height: (0, exports.getBoundsHeight)(bounds)
}); });
exports.getBoundsPoint = (0, memoization_1.memoize)(function (bounds) { return ({
    left: bounds.left,
    top: bounds.top
}); });
var scaleInnerBounds = function (inner, oldBounds, newBounds) {
    var oldBoundsSize = (0, exports.getBoundsSize)(oldBounds);
    var newBoundsSize = (0, exports.getBoundsSize)(newBounds);
    var innerBoundsSize = (0, exports.getBoundsSize)(inner);
    var percLeft = (inner.left - oldBounds.left) / oldBoundsSize.width;
    var percTop = (inner.top - oldBounds.top) / oldBoundsSize.height;
    var percWidth = innerBoundsSize.width / oldBoundsSize.width;
    var percHeight = innerBoundsSize.height / oldBoundsSize.height;
    var left = newBounds.left + newBoundsSize.width * percLeft;
    var top = newBounds.top + newBoundsSize.height * percTop;
    var right = left + newBoundsSize.width * percWidth;
    var bottom = top + newBoundsSize.height * percHeight;
    return {
        left: left,
        top: top,
        right: right,
        bottom: bottom
    };
};
exports.scaleInnerBounds = scaleInnerBounds;
var isBounds = function (bounds) {
    return bounds &&
        bounds.left != null &&
        bounds.top != null &&
        bounds.right != null &&
        bounds.bottom != null;
};
exports.isBounds = isBounds;
var filterBounded = function (values) {
    return values.filter(function (value) { return (0, exports.isBounds)(value.bounds); });
};
exports.filterBounded = filterBounded;
var mergeBounds = function () {
    var allBounds = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        allBounds[_i] = arguments[_i];
    }
    var left = Infinity;
    var bottom = -Infinity;
    var top = Infinity;
    var right = -Infinity;
    for (var _a = 0, allBounds_1 = allBounds; _a < allBounds_1.length; _a++) {
        var bounds = allBounds_1[_a];
        left = Math.min(left, bounds.left);
        right = Math.max(right, bounds.right);
        top = Math.min(top, bounds.top);
        bottom = Math.max(bottom, bounds.bottom);
    }
    return (0, exports.createBounds)(left, right, top, bottom);
};
exports.mergeBounds = mergeBounds;
var centerTransformZoom = function (translate, bounds, nz, point) {
    var oz = translate.zoom;
    var zd = nz / oz;
    var v1w = bounds.right - bounds.left;
    var v1h = bounds.bottom - bounds.top;
    // center is based on the mouse position
    var v1px = point ? point.left / v1w : 0.5;
    var v1py = point ? point.top / v1h : 0.5;
    // calculate v1 center x & y
    var v1cx = v1w * v1px;
    var v1cy = v1h * v1py;
    // old screen width & height
    var v2ow = v1w * oz;
    var v2oh = v1h * oz;
    // old offset pane left
    var v2ox = translate.left;
    var v2oy = translate.top;
    // new width of view 2
    var v2nw = v1w * nz;
    var v2nh = v1h * nz;
    // get the offset px & py of view 2
    var v2px = (v1cx - v2ox) / v2ow;
    var v2py = (v1cy - v2oy) / v2oh;
    var left = v1w * v1px - v2nw * v2px;
    var top = v1h * v1py - v2nh * v2py;
    return {
        left: left,
        top: top,
        zoom: nz
    };
};
exports.centerTransformZoom = centerTransformZoom;
var boundsIntersect = function (a, b) {
    return !(a.left > b.right ||
        a.right < b.left ||
        a.top > b.bottom ||
        a.bottom < a.top);
};
exports.boundsIntersect = boundsIntersect;
var pointIntersectsBounds = function (point, bounds) {
    return !(point.left < bounds.left ||
        point.left > bounds.right ||
        point.top < bounds.top ||
        point.top > bounds.bottom);
};
exports.pointIntersectsBounds = pointIntersectsBounds;
var getSmallestBounds = function () {
    var bounds = [];
    for (var _i = 0; _i < arguments.length; _i++) {
        bounds[_i] = arguments[_i];
    }
    return bounds.reduce(function (a, b) {
        var asize = (0, exports.getBoundsSize)(a);
        var bsize = (0, exports.getBoundsSize)(b);
        return asize.width * asize.height < bsize.width * bsize.height ? a : b;
    }, { left: Infinity, right: Infinity, top: Infinity, bottom: Infinity });
};
exports.getSmallestBounds = getSmallestBounds;
//# sourceMappingURL=geom.js.map

/***/ }),

/***/ "../common/lib/state/index.js":
/*!************************************!*\
  !*** ../common/lib/state/index.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./file */ "../common/lib/state/file.js"), exports);
__exportStar(__webpack_require__(/*! ./tree */ "../common/lib/state/tree.js"), exports);
__exportStar(__webpack_require__(/*! ./geom */ "../common/lib/state/geom.js"), exports);
__exportStar(__webpack_require__(/*! ./struct */ "../common/lib/state/struct.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../common/lib/state/struct.js":
/*!*************************************!*\
  !*** ../common/lib/state/struct.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=struct.js.map

/***/ }),

/***/ "../common/lib/state/tree.js":
/*!***********************************!*\
  !*** ../common/lib/state/tree.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addTreeNodeIds = exports.getParentTreeNode = exports.cloneTreeNode = exports.reduceTree = exports.dropChildNode = exports.insertChildNode = exports.appendChildNode = exports.updateNestedNodeTrail = exports.updateNestedNodeFromPath = exports.replaceNestedNode = exports.updateNestedNode = exports.removeNestedTreeNodeFromPath = exports.removeNestedTreeNode = exports.getRightMostTreeNode = exports.getTreeNodeUidGenerator = exports.generateTreeChecksum = exports.getTreeNodeHeight = exports.containsNestedTreeNodeById = exports.getNestedTreeNodeById = exports.getTreeNodeFromPath = exports.findNodeByTagName = exports.filterTreeNodeParents = exports.getTreeNodeAncestors = exports.findTreeNodeParent = exports.getTreeNodePath = exports.flattenTreeNode = exports.getTreeNodeIdMap = exports.getTreeNodesByName = exports.getNodeNameMap = exports.getChildParentMap = exports.filterNestedNodes = exports.createNodeNameMatcher = exports.createTreeNode = exports.findNestedNode = exports.TreeMoveOffset = void 0;
var memoization_1 = __webpack_require__(/*! ../utils/memoization */ "../common/lib/utils/memoization.js");
var crc32 = __webpack_require__(/*! crc32 */ "../../node_modules/crc32/lib/crc32.js");
var array_1 = __webpack_require__(/*! ../utils/array */ "../common/lib/utils/array/index.js");
var uid_1 = __webpack_require__(/*! ../utils/uid */ "../common/lib/utils/uid.js");
var uid_2 = __webpack_require__(/*! ../utils/uid */ "../common/lib/utils/uid.js");
var object_1 = __webpack_require__(/*! ../utils/object */ "../common/lib/utils/object.js");
var TreeMoveOffset;
(function (TreeMoveOffset) {
    TreeMoveOffset[TreeMoveOffset["PREPEND"] = 0] = "PREPEND";
    TreeMoveOffset[TreeMoveOffset["APPEND"] = Number.MAX_SAFE_INTEGER] = "APPEND";
    TreeMoveOffset[TreeMoveOffset["BEFORE"] = -1] = "BEFORE";
    TreeMoveOffset[TreeMoveOffset["AFTER"] = 1] = "AFTER";
})(TreeMoveOffset = exports.TreeMoveOffset || (exports.TreeMoveOffset = {}));
exports.findNestedNode = (0, memoization_1.memoize)(function (current, filter) {
    if (filter(current)) {
        return current;
    }
    var children = current.children;
    for (var i = 0, length_1 = children.length; i < length_1; i++) {
        var foundChild = (0, exports.findNestedNode)(children[i], filter);
        if (foundChild) {
            return foundChild;
        }
    }
});
var createTreeNode = function (name, children) {
    if (children === void 0) { children = []; }
    return ({
        id: (0, uid_2.generateUID)(),
        name: name,
        children: children
    });
};
exports.createTreeNode = createTreeNode;
exports.createNodeNameMatcher = (0, memoization_1.memoize)(function (name) { return function (node) {
    return node.name === name;
}; });
exports.filterNestedNodes = (0, memoization_1.memoize)(function (current, filter, found) {
    if (found === void 0) { found = []; }
    if (filter(current)) {
        found.push(current);
    }
    var children = current.children;
    for (var i = 0, length_2 = children.length; i < length_2; i++) {
        (0, exports.filterNestedNodes)(current.children[i], filter, found);
    }
    return found;
});
exports.getChildParentMap = (0, memoization_1.memoize)(function (current) {
    var idMap = (0, exports.getTreeNodeIdMap)(current);
    var parentChildMap = {};
    for (var id in idMap) {
        var parent_1 = idMap[id];
        for (var _i = 0, _a = parent_1.children; _i < _a.length; _i++) {
            var child = _a[_i];
            parentChildMap[child.id] = parent_1;
        }
    }
    return parentChildMap;
});
exports.getNodeNameMap = (0, memoization_1.memoize)(function (node) {
    var _a;
    var map = (_a = {}, _a[node.name] = [node], _a);
    for (var i = 0, length_3 = node.children.length; i < length_3; i++) {
        var childMap = (0, exports.getNodeNameMap)(node.children[i]);
        for (var name_1 in childMap) {
            map[name_1] = map[name_1] ? map[name_1].concat(childMap[name_1]) : childMap[name_1];
        }
    }
    return map;
});
var getTreeNodesByName = function (name, node) {
    return (0, exports.getNodeNameMap)(node)[name] || object_1.EMPTY_ARRAY;
};
exports.getTreeNodesByName = getTreeNodesByName;
exports.getTreeNodeIdMap = (0, memoization_1.memoize)(function (current) {
    var _a;
    if (!current.id) {
        throw new Error("ID missing from node");
    }
    var map = (_a = {},
        _a[current.id] = current,
        _a);
    Object.assign.apply(Object, __spreadArray([map], current.children.map(exports.getTreeNodeIdMap), false));
    return map;
});
exports.flattenTreeNode = (0, memoization_1.memoize)(function (current) {
    var treeNodeMap = (0, exports.getTreeNodeIdMap)(current);
    return Object.values(treeNodeMap);
});
exports.getTreeNodePath = (0, memoization_1.memoize)(function (nodeId, root) {
    var childParentMap = (0, exports.getChildParentMap)(root);
    var idMap = (0, exports.getTreeNodeIdMap)(root);
    var current = idMap[nodeId];
    var path = [];
    while (1) {
        var parent_2 = childParentMap[current.id];
        if (!parent_2)
            break;
        var i = parent_2.children.indexOf(current);
        if (i === -1) {
            throw new Error("parent child mismatch. Likely id collision");
        }
        path.unshift(i);
        current = parent_2;
    }
    return path;
});
var findTreeNodeParent = function (nodeId, root, filter) {
    var path = (0, exports.getTreeNodePath)(nodeId, root);
    if (!path.length)
        return null;
    for (var i = path.length; i--;) {
        var parent_3 = (0, exports.getTreeNodeFromPath)(path.slice(0, i), root);
        if (filter(parent_3)) {
            return parent_3;
        }
    }
};
exports.findTreeNodeParent = findTreeNodeParent;
var getTreeNodeAncestors = function (nodeId, root) {
    return (0, exports.filterTreeNodeParents)(nodeId, root, function () { return true; });
};
exports.getTreeNodeAncestors = getTreeNodeAncestors;
var filterTreeNodeParents = function (nodeId, root, filter) {
    var parents = [];
    var path = (0, exports.getTreeNodePath)(nodeId, root);
    if (!path.length)
        return null;
    for (var i = path.length; i--;) {
        var parent_4 = (0, exports.getTreeNodeFromPath)(path.slice(0, i), root);
        if (filter(parent_4)) {
            parents.push(parent_4);
        }
    }
    return parents;
};
exports.filterTreeNodeParents = filterTreeNodeParents;
exports.findNodeByTagName = (0, memoization_1.memoize)(function (root, name, namespace) {
    return (0, exports.findNestedNode)(root, function (child) { return child.name === name && child.namespace == namespace; });
});
exports.getTreeNodeFromPath = (0, memoization_1.memoize)(function (path, root) {
    var current = root;
    for (var i = 0, length_4 = path.length; i < length_4; i++) {
        current = current.children[path[i]];
    }
    return current;
});
var getNestedTreeNodeById = function (id, root) {
    return (0, exports.getTreeNodeIdMap)(root)[id];
};
exports.getNestedTreeNodeById = getNestedTreeNodeById;
var containsNestedTreeNodeById = function (id, root) {
    return Boolean((0, exports.getTreeNodeIdMap)(root)[id]);
};
exports.containsNestedTreeNodeById = containsNestedTreeNodeById;
var getTreeNodeHeight = function (id, root) { return (0, exports.getTreeNodePath)(id, root).length; };
exports.getTreeNodeHeight = getTreeNodeHeight;
exports.generateTreeChecksum = (0, memoization_1.memoize)(function (root) {
    return crc32(JSON.stringify(root));
});
exports.getTreeNodeUidGenerator = (0, memoization_1.memoize)(function (root) {
    var rightMostTreeNode = (0, exports.getRightMostTreeNode)(root);
    return (0, uid_1.createUIDGenerator)(crc32(rightMostTreeNode.id));
});
var getRightMostTreeNode = function (current) {
    return current.children.length
        ? (0, exports.getRightMostTreeNode)(current.children[current.children.length - 1])
        : current;
};
exports.getRightMostTreeNode = getRightMostTreeNode;
var removeNestedTreeNode = function (nestedChild, current) {
    return (0, exports.removeNestedTreeNodeFromPath)((0, exports.getTreeNodePath)(nestedChild.id, current), current);
};
exports.removeNestedTreeNode = removeNestedTreeNode;
var removeNestedTreeNodeFromPath = function (path, current) { return (0, exports.updateNestedNodeFromPath)(path, current, function (child) { return null; }); };
exports.removeNestedTreeNodeFromPath = removeNestedTreeNodeFromPath;
var updateNestedNode = function (nestedChild, current, updater) {
    return (0, exports.updateNestedNodeFromPath)((0, exports.getTreeNodePath)(nestedChild.id, current), current, updater);
};
exports.updateNestedNode = updateNestedNode;
var replaceNestedNode = function (newChild, oldChildId, root) {
    return newChild
        ? (0, exports.updateNestedNodeFromPath)((0, exports.getTreeNodePath)(oldChildId, root), root, function () { return newChild; })
        : (0, exports.removeNestedTreeNode)((0, exports.getNestedTreeNodeById)(oldChildId, root), root);
};
exports.replaceNestedNode = replaceNestedNode;
var updateNestedNodeFromPath = function (path, current, updater, depth) {
    if (depth === void 0) { depth = 0; }
    if (depth === path.length) {
        return updater(current);
    }
    var updatedChild = (0, exports.updateNestedNodeFromPath)(path, current.children[path[depth]], updater, depth + 1);
    return __assign(__assign({}, current), { children: updatedChild
            ? (0, array_1.arraySplice)(current.children, path[depth], 1, updatedChild)
            : (0, array_1.arraySplice)(current.children, path[depth], 1) });
};
exports.updateNestedNodeFromPath = updateNestedNodeFromPath;
var updateNestedNodeTrail = function (path, current, updater, depth) {
    if (depth === void 0) { depth = 0; }
    if (depth !== path.length) {
        var updatedChild = (0, exports.updateNestedNodeTrail)(path, current.children[path[depth]], updater, depth + 1);
        current = __assign(__assign({}, current), { children: updatedChild
                ? (0, array_1.arraySplice)(current.children, path[depth], 1, updatedChild)
                : (0, array_1.arraySplice)(current.children, path[depth], 1) });
    }
    return updater(current, depth, path);
};
exports.updateNestedNodeTrail = updateNestedNodeTrail;
var appendChildNode = function (child, parent) { return (0, exports.insertChildNode)(child, parent.children.length, parent); };
exports.appendChildNode = appendChildNode;
var insertChildNode = function (child, index, parent) { return (__assign(__assign({}, parent), { children: (0, array_1.arraySplice)(parent.children, index, 0, child) })); };
exports.insertChildNode = insertChildNode;
var dropChildNode = function (child, offset, relative, root) {
    if (offset === TreeMoveOffset.APPEND) {
        return (0, exports.updateNestedNode)(relative, root, function (relative) {
            return (0, exports.appendChildNode)(child, relative);
        });
    }
    else {
        var parent_5 = (0, exports.getParentTreeNode)(relative.id, root);
        var index_1 = parent_5.children.findIndex(function (child) { return child.id === relative.id; }) +
            (offset === TreeMoveOffset.BEFORE ? 0 : 1);
        return (0, exports.updateNestedNode)(parent_5, root, function () {
            return (0, exports.insertChildNode)(child, index_1, parent_5);
        });
    }
};
exports.dropChildNode = dropChildNode;
var reduceTree = function (node, reducer, initial) {
    var value = reducer(initial, node);
    for (var i = 0, length_5 = node.children.length; i < length_5; i++) {
        value = (0, exports.reduceTree)(node.children[i], reducer, value);
    }
    return value;
};
exports.reduceTree = reduceTree;
var cloneTreeNode = function (node, generateID) {
    if (generateID === void 0) { generateID = function (node) { return (0, uid_2.generateUID)(); }; }
    return (__assign(__assign({}, node), { id: generateID(node), children: node.children.map(function (child) { return (0, exports.cloneTreeNode)(child, generateID); }) }));
};
exports.cloneTreeNode = cloneTreeNode;
var getParentTreeNode = function (nodeId, root) { return (0, exports.getChildParentMap)(root)[nodeId]; };
exports.getParentTreeNode = getParentTreeNode;
var addTreeNodeIds = function (node, seed) {
    if (seed === void 0) { seed = ""; }
    return node.id ? node : (0, exports.cloneTreeNode)(node);
};
exports.addTreeNodeIds = addTreeNodeIds;
//# sourceMappingURL=tree.js.map

/***/ }),

/***/ "../common/lib/utils/array/immutable.js":
/*!**********************************************!*\
  !*** ../common/lib/utils/array/immutable.js ***!
  \**********************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.arrayRemove = exports.arraySplice = void 0;
var arraySplice = function (target, index, count) {
    if (count === void 0) { count = 1; }
    var replacements = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        replacements[_i - 3] = arguments[_i];
    }
    return __spreadArray(__spreadArray(__spreadArray([], target.slice(0, index), true), replacements, true), target.slice(index + count), true);
};
exports.arraySplice = arraySplice;
var arrayRemove = function (target, value) {
    var i = target.indexOf(value);
    return (0, exports.arraySplice)(target, i, 1);
};
exports.arrayRemove = arrayRemove;
//# sourceMappingURL=immutable.js.map

/***/ }),

/***/ "../common/lib/utils/array/index.js":
/*!******************************************!*\
  !*** ../common/lib/utils/array/index.js ***!
  \******************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./immutable */ "../common/lib/utils/array/immutable.js"), exports);
__exportStar(__webpack_require__(/*! ./ot */ "../common/lib/utils/array/ot.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../common/lib/utils/array/ot.js":
/*!***************************************!*\
  !*** ../common/lib/utils/array/ot.js ***!
  \***************************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patchArray = exports.diffArray = exports.ArrayUpdateMutation = exports.ArrayDeleteMutation = exports.ArrayInsertMutation = exports.ArrayOperationalTransform = exports.ArrayOperationalTransformType = void 0;
var ArrayOperationalTransformType;
(function (ArrayOperationalTransformType) {
    ArrayOperationalTransformType.INSERT = "insert";
    ArrayOperationalTransformType.UPDATE = "update";
    ArrayOperationalTransformType.DELETE = "delete";
})(ArrayOperationalTransformType = exports.ArrayOperationalTransformType || (exports.ArrayOperationalTransformType = {}));
var ArrayOperationalTransform = /** @class */ (function () {
    function ArrayOperationalTransform(type) {
        this.type = type;
    }
    return ArrayOperationalTransform;
}());
exports.ArrayOperationalTransform = ArrayOperationalTransform;
var ArrayInsertMutation = /** @class */ (function (_super) {
    __extends(ArrayInsertMutation, _super);
    function ArrayInsertMutation(index, value) {
        var _this = _super.call(this, ArrayOperationalTransformType.INSERT) || this;
        _this.index = index;
        _this.value = value;
        return _this;
    }
    return ArrayInsertMutation;
}(ArrayOperationalTransform));
exports.ArrayInsertMutation = ArrayInsertMutation;
var ArrayDeleteMutation = /** @class */ (function (_super) {
    __extends(ArrayDeleteMutation, _super);
    function ArrayDeleteMutation(value, index) {
        var _this = _super.call(this, ArrayOperationalTransformType.DELETE) || this;
        _this.value = value;
        _this.index = index;
        return _this;
    }
    return ArrayDeleteMutation;
}(ArrayOperationalTransform));
exports.ArrayDeleteMutation = ArrayDeleteMutation;
var ArrayUpdateMutation = /** @class */ (function (_super) {
    __extends(ArrayUpdateMutation, _super);
    function ArrayUpdateMutation(originalOldIndex, patchedOldIndex, newValue, index) {
        var _this = _super.call(this, ArrayOperationalTransformType.UPDATE) || this;
        _this.originalOldIndex = originalOldIndex;
        _this.patchedOldIndex = patchedOldIndex;
        _this.newValue = newValue;
        _this.index = index;
        return _this;
    }
    return ArrayUpdateMutation;
}(ArrayOperationalTransform));
exports.ArrayUpdateMutation = ArrayUpdateMutation;
function diffArray(oldArray, newArray, countDiffs) {
    // model used to figure out the proper mutation indices
    var model = [].concat(oldArray);
    // remaining old values to be matched with new values. Remainders get deleted.
    var oldPool = [].concat(oldArray);
    // remaining new values. Remainders get inserted.
    var newPool = [].concat(newArray);
    var mutations = [];
    var matches = [];
    for (var i = 0, n = oldPool.length; i < n; i++) {
        var oldValue = oldPool[i];
        var bestNewValue = void 0;
        var fewestDiffCount = Infinity;
        // there may be multiple matches, so look for the best one
        for (var j = 0, n2 = newPool.length; j < n2; j++) {
            var newValue = newPool[j];
            // -1 = no match, 0 = no change, > 0 = num diffs
            var diffCount = countDiffs(oldValue, newValue);
            if (~diffCount && diffCount < fewestDiffCount) {
                bestNewValue = newValue;
                fewestDiffCount = diffCount;
            }
            // 0 = exact match, so break here.
            if (fewestDiffCount === 0)
                break;
        }
        // subtract matches from both old & new pools and store
        // them for later use
        if (bestNewValue != null) {
            oldPool.splice(i--, 1);
            n--;
            newPool.splice(newPool.indexOf(bestNewValue), 1);
            // need to manually set array indice here to ensure that the order
            // of operations is correct when mutating the target array.
            matches[newArray.indexOf(bestNewValue)] = [oldValue, bestNewValue];
        }
    }
    for (var i = oldPool.length; i--;) {
        var oldValue = oldPool[i];
        var index = oldArray.indexOf(oldValue);
        mutations.push(new ArrayDeleteMutation(oldValue, index));
        model.splice(index, 1);
    }
    // sneak the inserts into the matches so that they're
    // ordered propertly along with the updates - particularly moves.
    for (var i = 0, n = newPool.length; i < n; i++) {
        var newValue = newPool[i];
        var index = newArray.indexOf(newValue);
        matches[index] = [undefined, newValue];
    }
    // apply updates last using indicies from the old array model. This ensures
    // that mutations are properly applied to whatever target array.
    for (var i = 0, n = matches.length; i < n; i++) {
        var match = matches[i];
        // there will be empty values since we're manually setting indices on the array above
        if (match == null)
            continue;
        var _a = matches[i], oldValue = _a[0], newValue = _a[1];
        var newIndex = i;
        // insert
        if (oldValue == null) {
            mutations.push(new ArrayInsertMutation(newIndex, newValue));
            model.splice(newIndex, 0, newValue);
            // updated
        }
        else {
            var oldIndex = model.indexOf(oldValue);
            mutations.push(new ArrayUpdateMutation(oldArray.indexOf(oldValue), oldIndex, newValue, newIndex));
            if (oldIndex !== newIndex) {
                model.splice(oldIndex, 1);
                model.splice(newIndex, 0, oldValue);
            }
        }
    }
    return mutations;
}
exports.diffArray = diffArray;
function patchArray(target, ots, mapUpdate, mapInsert) {
    if (mapInsert === void 0) { mapInsert = function (b) { return b; }; }
    if (!ots.length) {
        return target;
    }
    var newTarget = __spreadArray([], target, true);
    for (var _i = 0, ots_1 = ots; _i < ots_1.length; _i++) {
        var ot = ots_1[_i];
        switch (ot.type) {
            case ArrayOperationalTransformType.INSERT: {
                var _a = ot, value = _a.value, index = _a.index;
                newTarget.splice(index, 0, mapInsert(value));
                break;
            }
            case ArrayOperationalTransformType.DELETE: {
                var index = ot.index;
                newTarget.splice(index, 1);
            }
            case ArrayOperationalTransformType.UPDATE: {
                var _b = ot, patchedOldIndex = _b.patchedOldIndex, newValue = _b.newValue, index = _b.index;
                var oldValue = target[patchedOldIndex];
                var patchedValue = mapUpdate(oldValue, newValue);
                if (patchedValue !== oldValue || patchedOldIndex !== index) {
                    if (patchedOldIndex !== index) {
                        newTarget.splice(patchedOldIndex, 1);
                    }
                    newTarget.splice(index, 0, patchedValue);
                }
            }
        }
    }
    return newTarget;
}
exports.patchArray = patchArray;
//# sourceMappingURL=ot.js.map

/***/ }),

/***/ "../common/lib/utils/dnd.js":
/*!**********************************!*\
  !*** ../common/lib/utils/dnd.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.startDOMDrag = void 0;
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var startDOMDrag = function (startEvent, onStart, update, stop) {
    if (stop === void 0) { stop = undefined; }
    var sx = startEvent.clientX;
    var sy = startEvent.clientY;
    var doc = startEvent.target.ownerDocument;
    var _animating;
    var _started;
    // slight delay to prevent accidental drag from firing
    // if the user does some other mouse interaction such as a double click.
    var drag = (0, lodash_1.throttle)(function (event) {
        if (!_started) {
            _started = true;
            onStart(event);
        }
        event.preventDefault();
        update(event, {
            delta: {
                x: event.clientX - sx,
                y: event.clientY - sy
            }
        });
    }, 10);
    function onMouseUp(event) {
        doc.removeEventListener("mousemove", drag);
        doc.removeEventListener("mouseup", onMouseUp);
        if (stop && _started) {
            stop(event, {
                delta: {
                    x: event.clientX - sx,
                    y: event.clientY - sy
                }
            });
        }
    }
    doc.addEventListener("mousemove", drag);
    doc.addEventListener("mouseup", onMouseUp);
};
exports.startDOMDrag = startDOMDrag;
//# sourceMappingURL=dnd.js.map

/***/ }),

/***/ "../common/lib/utils/file.js":
/*!***********************************!*\
  !*** ../common/lib/utils/file.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports) {

"use strict";

var __spreadArray = (this && this.__spreadArray) || function (to, from, pack) {
    if (pack || arguments.length === 2) for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
            if (!ar) ar = Array.prototype.slice.call(from, 0, i);
            ar[i] = from[i];
        }
    }
    return to.concat(ar || Array.prototype.slice.call(from));
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.normalizeFilePath = exports.resolveFilePath = void 0;
var resolveFilePath = function (relativePath, fromPath) {
    var pp1 = fromPath.split(/[\\/]/);
    var pp2 = relativePath.split(/[\\/]/);
    pp1.pop();
    if (pp2[0] === ".") {
        pp2.shift();
    }
    else {
        while (pp2[0] === "..") {
            pp2.shift();
            pp1.pop();
        }
    }
    return __spreadArray(__spreadArray([], pp1, true), pp2, true).join("/");
};
exports.resolveFilePath = resolveFilePath;
var normalizeFilePath = function (filePath) {
    return filePath.replace(/[\\]/g, "/").replace("C:/", "/");
};
exports.normalizeFilePath = normalizeFilePath;
//# sourceMappingURL=file.js.map

/***/ }),

/***/ "../common/lib/utils/html.js":
/*!***********************************!*\
  !*** ../common/lib/utils/html.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringifyStyle = void 0;
var stringifyStyle = function (style) {
    var buffer = "";
    for (var name_1 in style) {
        if (style[name_1] == null)
            continue;
        buffer += "".concat(name_1, ":").concat(style[name_1], ";");
    }
    return buffer;
};
exports.stringifyStyle = stringifyStyle;
//# sourceMappingURL=html.js.map

/***/ }),

/***/ "../common/lib/utils/iframe.js":
/*!*************************************!*\
  !*** ../common/lib/utils/iframe.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.bubbleHTMLIframeEvents = void 0;
var transform_1 = __webpack_require__(/*! ./transform */ "../common/lib/utils/transform.js");
function bubbleHTMLIframeEvents(iframe, options) {
    if (options === void 0) { options = {}; }
    var window = iframe.contentWindow;
    var body = window.document.childNodes[0];
    var translateMousePositions = options.translateMousePositions !== false;
    // TODO - this should be in its own util function
    function bubbleEvent(event) {
        if (/key|input/.test(event.type) &&
            options.ignoreInputEvents &&
            (/textarea|input/i.test(event.target.nodeName) ||
                event.target.contentEditable === "true")) {
            return;
        }
        var clonedEvent = new Event(event.type, {
            bubbles: true,
            cancelable: true
        });
        var rect = iframe.getBoundingClientRect();
        var actualRect = (0, transform_1.calculateAbsoluteBounds)(iframe);
        var zoom = rect.width / (actualRect.right - actualRect.left);
        for (var key in event) {
            var value = event[key];
            if (typeof value === "function") {
                value = value.bind(event);
            }
            if (translateMousePositions) {
                if (key === "pageX" || key === "clientX") {
                    value = rect.left + value * zoom;
                }
                if (key === "pageY" || key === "clientY") {
                    value = rect.top + value * zoom;
                }
            }
            // bypass read-only issues here
            try {
                clonedEvent[key] = value;
            }
            catch (e) { }
        }
        iframe.dispatchEvent(clonedEvent);
        if (clonedEvent.defaultPrevented) {
            event.preventDefault();
        }
    }
    var eventTypes = [
        "keypress",
        "copy",
        // these bust react-dnd, so don't use them
        // "dragenter",
        // "dragexit",
        // "dragend",
        // "dragover",
        // "drop",
        "paste",
        "mousemove",
        "mousedown",
        "contextmenu",
        "mouseup",
        "keyup",
        "keydown",
        "paste",
        "touchstart",
        "touchmove",
        "touchend"
    ];
    for (var _i = 0, eventTypes_1 = eventTypes; _i < eventTypes_1.length; _i++) {
        var eventType = eventTypes_1[_i];
        body.addEventListener(eventType, bubbleEvent);
    }
    if (options.ignoreScrollEvents !== true) {
        window.addEventListener("wheel", bubbleEvent);
        window.addEventListener("scroll", bubbleEvent);
        window.addEventListener("touchmove", bubbleEvent);
        window.addEventListener("touchstart", bubbleEvent);
        window.addEventListener("touchend", bubbleEvent);
    }
}
exports.bubbleHTMLIframeEvents = bubbleHTMLIframeEvents;
//# sourceMappingURL=iframe.js.map

/***/ }),

/***/ "../common/lib/utils/immutable.js":
/*!****************************************!*\
  !*** ../common/lib/utils/immutable.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateProperties = void 0;
var updateProperties = function (properties, target) {
    var newProps = {};
    var hasNewProps = false;
    for (var key in properties) {
        var newValue = properties[key];
        if (target[key] !== newValue) {
            newProps[key] = newValue;
            hasNewProps = true;
        }
    }
    if (!hasNewProps) {
        return target;
    }
    return Object.assign({}, target, properties);
};
exports.updateProperties = updateProperties;
//# sourceMappingURL=immutable.js.map

/***/ }),

/***/ "../common/lib/utils/index.js":
/*!************************************!*\
  !*** ../common/lib/utils/index.js ***!
  \************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./array */ "../common/lib/utils/array/index.js"), exports);
__exportStar(__webpack_require__(/*! ./memoization */ "../common/lib/utils/memoization.js"), exports);
__exportStar(__webpack_require__(/*! ./file */ "../common/lib/utils/file.js"), exports);
__exportStar(__webpack_require__(/*! ./object */ "../common/lib/utils/object.js"), exports);
__exportStar(__webpack_require__(/*! ./iframe */ "../common/lib/utils/iframe.js"), exports);
__exportStar(__webpack_require__(/*! ./dnd */ "../common/lib/utils/dnd.js"), exports);
__exportStar(__webpack_require__(/*! ./html */ "../common/lib/utils/html.js"), exports);
__exportStar(__webpack_require__(/*! ./uid */ "../common/lib/utils/uid.js"), exports);
// export * from "./tree";
__exportStar(__webpack_require__(/*! ./types */ "../common/lib/utils/types.js"), exports);
__exportStar(__webpack_require__(/*! ./protocol */ "../common/lib/utils/protocol.js"), exports);
__exportStar(__webpack_require__(/*! ./immutable */ "../common/lib/utils/immutable.js"), exports);
__exportStar(__webpack_require__(/*! ./performance */ "../common/lib/utils/performance.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../common/lib/utils/memoization.js":
/*!******************************************!*\
  !*** ../common/lib/utils/memoization.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.underchange = exports.reuser = exports.shallowEquals = exports.memoize = void 0;
var lru = __webpack_require__(/*! lru-cache */ "../../node_modules/lru-cache/index.js");
var DEFAULT_LRU_MAX = 1000;
// need this for default arguments
var getArgumentCount = function (fn) {
    var str = fn.toString();
    var params = str.match(/\(.*?\)/)[0];
    var args = params
        .substr(1, params.length - 2)
        .split(/\s*,\s*/)
        .filter(function (arg) { return arg.substr(0, 3) !== "..."; });
    return args.length;
};
var memoize = function (fn, lruMax, argumentCount) {
    if (lruMax === void 0) { lruMax = DEFAULT_LRU_MAX; }
    if (argumentCount === void 0) { argumentCount = getArgumentCount(fn); }
    if (argumentCount == Infinity || isNaN(argumentCount)) {
        throw new Error("Argument count cannot be Infinity, 0, or NaN.");
    }
    if (!argumentCount) {
        console.error("Argument count should not be 0. Defaulting to 1.");
        argumentCount = 1;
    }
    return compilFastMemoFn(argumentCount, lruMax > 0)(fn, lru({ max: lruMax }));
};
exports.memoize = memoize;
var shallowEquals = function (a, b) {
    var toa = typeof a;
    var tob = typeof b;
    if (toa !== tob) {
        return false;
    }
    if (toa !== "object" || !a || !b) {
        return a === b;
    }
    if (Object.keys(a).length !== Object.keys(b).length) {
        return false;
    }
    for (var key in a) {
        if (a[key] !== b[key]) {
            return false;
        }
    }
    return true;
};
exports.shallowEquals = shallowEquals;
var reuser = function (lruMax, getKey, equals) {
    if (lruMax === void 0) { lruMax = DEFAULT_LRU_MAX; }
    if (equals === void 0) { equals = exports.shallowEquals; }
    var cache = lru({ max: lruMax });
    return function (value) {
        var key = getKey(value);
        if (!cache.has(key) || !equals(cache.get(key), value)) {
            cache.set(key, value);
        }
        return cache.get(key);
    };
};
exports.reuser = reuser;
var _memoFns = {};
var compilFastMemoFn = function (argumentCount, acceptPrimitives) {
    var hash = "" + argumentCount + acceptPrimitives;
    if (_memoFns[hash]) {
        return _memoFns[hash];
    }
    var args = Array.from({ length: argumentCount }).map(function (v, i) { return "arg".concat(i); });
    var buffer = "\n  return function(fn, keyMemo) {\n    var memo = new WeakMap();\n    return function(".concat(args.join(", "), ") {\n      var currMemo = memo, prevMemo, key;\n  ");
    for (var i = 0, n = args.length - 1; i < n; i++) {
        var arg = args[i];
        buffer += "\n      prevMemo = currMemo;\n      key      = ".concat(arg, ";\n      ").concat(acceptPrimitives
            ? "if ((typeof key !== \"object\" || !key) && !(key = keyMemo.get(".concat(arg, "))) {\n        keyMemo.set(").concat(arg, ", key = {});\n      }")
            : "", "\n      if (!(currMemo = currMemo.get(key))) {\n        prevMemo.set(key, currMemo = new WeakMap());\n      }\n    ");
    }
    var lastArg = args[args.length - 1];
    buffer += "\n      key = ".concat(lastArg, ";\n      ").concat(acceptPrimitives
        ? "\n      if ((typeof key !== \"object\" || !key) && !(key = keyMemo.get(".concat(lastArg, "))) {\n        keyMemo.set(").concat(lastArg, ", key = {});\n      }")
        : "", "\n\n      if (!currMemo.has(key)) {\n        currMemo.set(key, fn(").concat(args.join(", "), "));\n      }\n\n      return currMemo.get(key);\n    };\n  };\n  ");
    return (_memoFns[hash] = new Function(buffer)());
};
/**
 * Calls target function once & proxies passed functions
 * @param fn
 */
var underchange = function (fn) {
    var currentArgs = [];
    var ret;
    var started;
    var start = function () {
        if (started) {
            return ret;
        }
        started = true;
        return (ret = fn.apply(void 0, currentArgs.map(function (a, i) { return function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            return currentArgs[i].apply(currentArgs, args);
        }; })));
    };
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        currentArgs = args;
        return start();
    });
};
exports.underchange = underchange;
//# sourceMappingURL=memoization.js.map

/***/ }),

/***/ "../common/lib/utils/object.js":
/*!*************************************!*\
  !*** ../common/lib/utils/object.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.stringifyObject = exports.EMPTY_ARRAY = exports.EMPTY_OBJECT = void 0;
var memoization_1 = __webpack_require__(/*! ./memoization */ "../common/lib/utils/memoization.js");
exports.EMPTY_OBJECT = {};
exports.EMPTY_ARRAY = [];
exports.stringifyObject = (0, memoization_1.memoize)(function (obj) {
    var tobj = typeof obj;
    if (Array.isArray(obj)) {
        return "[".concat(obj.map(function (v) { return (0, exports.stringifyObject)(v); }).join(","), "]");
    }
    else if (tobj === "object") {
        if (obj) {
            var keys = Object.keys(obj);
            return "{".concat(keys
                .map(function (key) { return "\"".concat(key, "\": ").concat((0, exports.stringifyObject)(obj[key])); })
                .join(","), "}");
        }
        else {
            return "null";
        }
    }
    return JSON.stringify(obj);
});
//# sourceMappingURL=object.js.map

/***/ }),

/***/ "../common/lib/utils/performance.js":
/*!******************************************!*\
  !*** ../common/lib/utils/performance.js ***!
  \******************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pmark = void 0;
var pmark = function (label) {
    if (false) {}
    performance.mark("start ".concat(label));
    return {
        end: function () {
            performance.mark("end ".concat(label));
            performance.measure("".concat(label), "start ".concat(label), "end ".concat(label));
        }
    };
};
exports.pmark = pmark;
//# sourceMappingURL=performance.js.map

/***/ }),

/***/ "../common/lib/utils/protocol.js":
/*!***************************************!*\
  !*** ../common/lib/utils/protocol.js ***!
  \***************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.FILE_PROTOCOL = exports.addProtocol = exports.stripProtocol = void 0;
var stripProtocol = function (uri) { return uri.replace(/^\w+:\/\//, ""); };
exports.stripProtocol = stripProtocol;
var addProtocol = function (protocol, uri) {
    return protocol + "//" + (0, exports.stripProtocol)(uri);
};
exports.addProtocol = addProtocol;
exports.FILE_PROTOCOL = "file:";
//# sourceMappingURL=protocol.js.map

/***/ }),

/***/ "../common/lib/utils/transform.js":
/*!****************************************!*\
  !*** ../common/lib/utils/transform.js ***!
  \****************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.calculateAbsoluteBounds = exports.getRelativeElementPosition = exports.calculateUntransformedBoundingRect = exports.calculateCSSMeasurments = exports.translateAbsoluteToRelativePoint = void 0;
var state_1 = __webpack_require__(/*! ../state */ "../common/lib/state/index.js");
function translateAbsoluteToRelativePoint(event, relativeElement) {
    var zoom = relativeElement;
    var left = event.clientX || event.left;
    var top = event.clientY || event.top;
    var bounds = relativeElement.getBoundingClientRect();
    var rx = left - bounds.left;
    var ry = top - bounds.top;
    return { left: rx, top: ry };
}
exports.translateAbsoluteToRelativePoint = translateAbsoluteToRelativePoint;
function calculateCSSMeasurments(style) {
    var calculated = {};
    for (var key in style) {
        if (hasMeasurement(key)) {
            calculated[key] = Number(style[key].replace("px", ""));
        }
    }
    return calculated;
}
exports.calculateCSSMeasurments = calculateCSSMeasurments;
/**
 * Robust method for fetching parent nodes outside
 * of an iframe
 */
function getParentNode(node) {
    var parentNode = node.parentNode;
    // if (parentNode) {
    //   if (parentNode.nodeName === "#document") {
    //     const localWindow  = node.ownerDocument.defaultView;
    //     if (localWindow && localWindow !== window) {
    //       const parentWindow = localWindow.parent;
    //       return Array.prototype.find.call(parentWindow.document.querySelectorAll("iframe"), (iframe) => {
    //         return iframe.contentWindow === localWindow;
    //       });
    //     }
    //   // shadow root
    //   } else if (parentNode.nodeName === "#document-fragment" && parentNode["host"]) {
    //     return parentNode["host"];
    //   }
    // }
    return parentNode;
}
function parseCSSMatrixValue(value) {
    return value
        .replace(/matrix\((.*?)\)/, "$1")
        .split(/,\s/)
        .map(function (value) { return Number(value); });
}
function calculateTransform(node, includeIframes) {
    if (includeIframes === void 0) { includeIframes = true; }
    var cnode = node;
    var matrix = [0, 0, 0, 0, 0, 0];
    while (cnode) {
        if (cnode.nodeName === "IFRAME" && cnode !== node && !includeIframes) {
            break;
        }
        if (cnode.nodeType === 1) {
            // TODO - this needs to be memoized - getComputedStyle is expensive.
            var style = cnode.ownerDocument.defaultView.getComputedStyle(cnode);
            if (style.transform !== "none") {
                var cnodeMatrix = parseCSSMatrixValue(style.transform);
                for (var i = cnodeMatrix.length; i--;) {
                    matrix[i] += cnodeMatrix[i];
                }
            }
        }
        cnode = getParentNode(cnode);
    }
    return [
        matrix[0] || 1,
        matrix[1],
        matrix[2],
        matrix[3] || 1,
        matrix[4],
        matrix[5]
    ];
}
function calculateUntransformedBoundingRect(node) {
    var rect = node.getBoundingClientRect();
    var bounds = (0, state_1.createBounds)(rect.left, rect.right, rect.top, rect.bottom);
    var matrix = calculateTransform(node, false);
    return (0, state_1.zoomBounds)((0, state_1.shiftBounds)(bounds, { left: -matrix[4], top: -matrix[5] }), 1 / matrix[0]);
}
exports.calculateUntransformedBoundingRect = calculateUntransformedBoundingRect;
function hasMeasurement(key) {
    return /left|top|right|bottom|width|height|padding|margin|border/.test(key);
}
function roundMeasurements(style) {
    var roundedStyle = {};
    for (var key in style) {
        var measurement = (roundedStyle[key] = style[key]);
        if (hasMeasurement(key)) {
            var value = measurement.match(/^(-?[\d\.]+)/)[1];
            var unit = measurement.match(/([a-z]+)$/)[1];
            // ceiling is necessary here for zoomed in elements
            roundedStyle[key] = Math.round(Number(value)) + unit;
        }
    }
    return roundedStyle;
}
var getRelativeElementPosition = function (element) {
    var style = element.ownerDocument.defaultView.getComputedStyle(element);
};
exports.getRelativeElementPosition = getRelativeElementPosition;
function calculateAbsoluteBounds(node) {
    var rect = calculateUntransformedBoundingRect(node);
    return rect;
}
exports.calculateAbsoluteBounds = calculateAbsoluteBounds;
function calculateElementTransforms(node) {
    var computedStyle = calculateCSSMeasurments(node.ownerDocument.defaultView.getComputedStyle(node));
    var oldWidth = node.style.width;
    var oldTop = node.style.top;
    var oldLeft = node.style.left;
    var oldBoundsSizing = node.style.boxSizing;
    node.style.left = "0px";
    node.style.top = "0px";
    node.style.width = "100px";
    node.style.boxSizing = "border-bounds";
    var bounds = this.bounds;
    var scale = bounds.width / 100;
    var left = bounds.left;
    var top = bounds.top;
    node.style.left = oldLeft;
    node.style.top = oldTop;
    node.style.width = oldWidth;
    node.style.boxSizing = oldBoundsSizing;
    return { scale: scale, left: left, top: top };
}
//# sourceMappingURL=transform.js.map

/***/ }),

/***/ "../common/lib/utils/types.js":
/*!************************************!*\
  !*** ../common/lib/utils/types.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
//# sourceMappingURL=types.js.map

/***/ }),

/***/ "../common/lib/utils/uid.js":
/*!**********************************!*\
  !*** ../common/lib/utils/uid.js ***!
  \**********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.generateUID = exports.createUIDGenerator = void 0;
var crc32 = __webpack_require__(/*! crc32 */ "../../node_modules/crc32/lib/crc32.js");
// export type ChecksumGenerator<TObject> = (value: TObject) => string;
var createUIDGenerator = function (seed, index) {
    if (index === void 0) { index = 0; }
    return function () { return seed + index++; };
};
exports.createUIDGenerator = createUIDGenerator;
exports.generateUID = (0, exports.createUIDGenerator)(crc32(String("".concat(Date.now(), ".").concat(Math.random()))));
//# sourceMappingURL=uid.js.map

/***/ }),

/***/ "../fsbox/index.js":
/*!*************************!*\
  !*** ../fsbox/index.js ***!
  \*************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib */ "../fsbox/lib/index.js");


/***/ }),

/***/ "../fsbox/lib/actions.js":
/*!*******************************!*\
  !*** ../fsbox/lib/actions.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fileChanged = exports.fsSandboxItemSaved = exports.fsSandboxItemSaving = exports.fsSandboxItemLoading = exports.fsSandboxItemLoaded = exports.FileChangedEventType = exports.FILE_CHANGED = exports.FS_SANDBOX_ITEM_SAVING = exports.FS_SANDBOX_ITEM_SAVED = exports.FS_SANDBOX_ITEM_LOADED = exports.FS_SANDBOX_ITEM_LOADING = void 0;
exports.FS_SANDBOX_ITEM_LOADING = "FS_SANDBOX_ITEM_LOADING";
exports.FS_SANDBOX_ITEM_LOADED = "FS_SANDBOX_ITEM_LOADED";
exports.FS_SANDBOX_ITEM_SAVED = "FS_SANDBOX_ITEM_SAVED";
exports.FS_SANDBOX_ITEM_SAVING = "FS_SANDBOX_ITEM_SAVING";
exports.FILE_CHANGED = "FILE_CHANGED";
var FileChangedEventType;
(function (FileChangedEventType) {
    FileChangedEventType["UNLINK"] = "unlink";
    FileChangedEventType["ADD"] = "add";
    FileChangedEventType["UNLINK_DIR"] = "unlinkDir";
    FileChangedEventType["ADD_DIR"] = "addDir";
    FileChangedEventType["CHANGE"] = "change";
})(FileChangedEventType = exports.FileChangedEventType || (exports.FileChangedEventType = {}));
var fsSandboxItemLoaded = function (uri, content, mimeType) { return ({
    uri: uri,
    content: content,
    mimeType: mimeType,
    type: exports.FS_SANDBOX_ITEM_LOADED
}); };
exports.fsSandboxItemLoaded = fsSandboxItemLoaded;
var fsSandboxItemLoading = function (uri) { return ({
    uri: uri,
    type: exports.FS_SANDBOX_ITEM_LOADING
}); };
exports.fsSandboxItemLoading = fsSandboxItemLoading;
var fsSandboxItemSaving = function (uri) { return ({
    uri: uri,
    type: exports.FS_SANDBOX_ITEM_SAVING
}); };
exports.fsSandboxItemSaving = fsSandboxItemSaving;
var fsSandboxItemSaved = function (uri) { return ({
    uri: uri,
    type: exports.FS_SANDBOX_ITEM_SAVED
}); };
exports.fsSandboxItemSaved = fsSandboxItemSaved;
var fileChanged = function (eventType, uri) { return ({
    type: exports.FILE_CHANGED,
    eventType: eventType,
    uri: uri
}); };
exports.fileChanged = fileChanged;
//# sourceMappingURL=actions.js.map

/***/ }),

/***/ "../fsbox/lib/index.js":
/*!*****************************!*\
  !*** ../fsbox/lib/index.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./saga */ "../fsbox/lib/saga.js"), exports);
__exportStar(__webpack_require__(/*! ./reducer */ "../fsbox/lib/reducer.js"), exports);
__exportStar(__webpack_require__(/*! ./state */ "../fsbox/lib/state.js"), exports);
__exportStar(__webpack_require__(/*! ./actions */ "../fsbox/lib/actions.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../fsbox/lib/reducer.js":
/*!*******************************!*\
  !*** ../fsbox/lib/reducer.js ***!
  \*******************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.fsSandboxReducer = void 0;
var state_1 = __webpack_require__(/*! ./state */ "../fsbox/lib/state.js");
var actions_1 = __webpack_require__(/*! ./actions */ "../fsbox/lib/actions.js");
var fsSandboxReducer = function (state, action) {
    switch (action.type) {
        case actions_1.FS_SANDBOX_ITEM_LOADING: {
            var uri = action.uri;
            return (0, state_1.updateFileCacheItem)({ status: state_1.FileCacheItemStatus.LOADING }, uri, state);
        }
        case actions_1.FS_SANDBOX_ITEM_LOADED: {
            var _a = action, uri = _a.uri, content = _a.content, mimeType = _a.mimeType;
            return (0, state_1.updateFileCacheItem)({ status: state_1.FileCacheItemStatus.LOADED, content: content, mimeType: mimeType }, uri, state);
        }
        case actions_1.FS_SANDBOX_ITEM_SAVING: {
            var uri = action.uri;
            return (0, state_1.updateFileCacheItem)({ status: state_1.FileCacheItemStatus.SAVING }, uri, state);
        }
        case actions_1.FS_SANDBOX_ITEM_SAVED: {
            var uri = action.uri;
            return (0, state_1.updateFileCacheItem)({ status: state_1.FileCacheItemStatus.LOADED, dirty: false }, uri, state);
        }
    }
    return state;
};
exports.fsSandboxReducer = fsSandboxReducer;
//# sourceMappingURL=reducer.js.map

/***/ }),

/***/ "../fsbox/lib/saga.js":
/*!****************************!*\
  !*** ../fsbox/lib/saga.js ***!
  \****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createFSSandboxSaga = exports.setReaderMimetype = void 0;
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var effects_1 = __webpack_require__(/*! redux-saga/effects */ "../../node_modules/redux-saga/es/effects.js");
var state_1 = __webpack_require__(/*! ./state */ "../fsbox/lib/state.js");
var actions_1 = __webpack_require__(/*! ./actions */ "../fsbox/lib/actions.js");
var setReaderMimetype = function (mimeType, extensions) { return function (readFile) { return function (uri) { return __awaiter(void 0, void 0, void 0, function () {
    var content;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                if (extensions.indexOf(path.extname(uri)) === -1) {
                    return [2 /*return*/, readFile(uri)];
                }
                return [4 /*yield*/, readFile(uri)];
            case 1:
                content = (_a.sent()).content;
                return [2 /*return*/, { content: content, mimeType: mimeType }];
        }
    });
}); }; }; };
exports.setReaderMimetype = setReaderMimetype;
var createFSSandboxSaga = function (_a) {
    var readFile = _a.readFile, writeFile = _a.writeFile;
    return function () {
        function handleUpdatedFile(item) {
            return __generator(this, function (_a) {
                switch (_a.label) {
                    case 0:
                        if (!(item.status === state_1.FileCacheItemStatus.CREATED)) return [3 /*break*/, 2];
                        return [4 /*yield*/, (0, effects_1.call)(loadFile, item.uri)];
                    case 1:
                        _a.sent();
                        return [3 /*break*/, 4];
                    case 2:
                        if (!(item.status === state_1.FileCacheItemStatus.SAVE_REQUESTED)) return [3 /*break*/, 4];
                        return [4 /*yield*/, (0, effects_1.call)(saveFile, item)];
                    case 3:
                        _a.sent();
                        _a.label = 4;
                    case 4: return [2 /*return*/];
                }
            });
        }
        function loadFile(uri) {
            var _a, content, mimeType;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, effects_1.put)((0, actions_1.fsSandboxItemLoading)(uri))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, effects_1.call)(readFile, uri)];
                    case 2:
                        _a = _b.sent(), content = _a.content, mimeType = _a.mimeType;
                        return [4 /*yield*/, (0, effects_1.put)((0, actions_1.fsSandboxItemLoaded)(uri, content, mimeType))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }
        function saveFile(_a) {
            var uri = _a.uri, content = _a.content;
            return __generator(this, function (_b) {
                switch (_b.label) {
                    case 0: return [4 /*yield*/, (0, effects_1.put)((0, actions_1.fsSandboxItemSaving)(uri))];
                    case 1:
                        _b.sent();
                        return [4 /*yield*/, (0, effects_1.call)(writeFile, uri, content)];
                    case 2:
                        _b.sent();
                        return [4 /*yield*/, (0, effects_1.put)((0, actions_1.fsSandboxItemSaved)(uri))];
                    case 3:
                        _b.sent();
                        return [2 /*return*/];
                }
            });
        }
        return __generator(this, function (_a) {
            switch (_a.label) {
                case 0: return [4 /*yield*/, (0, effects_1.fork)(function handleFileChanges() {
                        var prevState, state, updatedFiles, uri, _a, _b, _i, uri;
                        return __generator(this, function (_c) {
                            switch (_c.label) {
                                case 0:
                                    if (false) {}
                                    return [4 /*yield*/, (0, effects_1.take)()];
                                case 1:
                                    _c.sent();
                                    return [4 /*yield*/, (0, effects_1.select)()];
                                case 2:
                                    state = _c.sent();
                                    if (prevState && state.fileCache === prevState.fileCache) {
                                        return [3 /*break*/, 0];
                                    }
                                    updatedFiles = {};
                                    for (uri in state.fileCache) {
                                        if (!prevState || prevState.fileCache[uri] !== state.fileCache[uri]) {
                                            updatedFiles[uri] = state.fileCache[uri];
                                        }
                                    }
                                    prevState = state;
                                    _a = [];
                                    for (_b in updatedFiles)
                                        _a.push(_b);
                                    _i = 0;
                                    _c.label = 3;
                                case 3:
                                    if (!(_i < _a.length)) return [3 /*break*/, 6];
                                    uri = _a[_i];
                                    return [4 /*yield*/, (0, effects_1.spawn)(handleUpdatedFile, updatedFiles[uri])];
                                case 4:
                                    _c.sent();
                                    _c.label = 5;
                                case 5:
                                    _i++;
                                    return [3 /*break*/, 3];
                                case 6: return [3 /*break*/, 0];
                                case 7: return [2 /*return*/];
                            }
                        });
                    })];
                case 1:
                    _a.sent();
                    return [4 /*yield*/, (0, effects_1.fork)(function handleLocalChanges() {
                            var _loop_1;
                            return __generator(this, function (_a) {
                                switch (_a.label) {
                                    case 0:
                                        _loop_1 = function () {
                                            var uri, state;
                                            return __generator(this, function (_b) {
                                                switch (_b.label) {
                                                    case 0: return [4 /*yield*/, (0, effects_1.take)(function (action) {
                                                            return (action.type === actions_1.FILE_CHANGED &&
                                                                action.eventType === actions_1.FileChangedEventType.CHANGE);
                                                        })];
                                                    case 1:
                                                        uri = (_b.sent()).uri;
                                                        return [4 /*yield*/, (0, effects_1.select)()];
                                                    case 2:
                                                        state = _b.sent();
                                                        // This will happen if FileChanged is fired on a FS item that isn't also in cache. I.e:
                                                        // the changed FS item has not _explicitly_ been added via queueOpenFile
                                                        if (!state.fileCache[uri]) {
                                                            return [2 /*return*/, "continue"];
                                                        }
                                                        return [4 /*yield*/, (0, effects_1.spawn)(function () {
                                                                return __generator(this, function (_a) {
                                                                    switch (_a.label) {
                                                                        case 0: return [4 /*yield*/, (0, effects_1.call)(loadFile, uri)];
                                                                        case 1:
                                                                            _a.sent();
                                                                            return [2 /*return*/];
                                                                    }
                                                                });
                                                            })];
                                                    case 3:
                                                        _b.sent();
                                                        return [2 /*return*/];
                                                }
                                            });
                                        };
                                        _a.label = 1;
                                    case 1:
                                        if (false) {}
                                        return [5 /*yield**/, _loop_1()];
                                    case 2:
                                        _a.sent();
                                        return [3 /*break*/, 1];
                                    case 3: return [2 /*return*/];
                                }
                            });
                        })];
                case 2:
                    _a.sent();
                    return [2 /*return*/];
            }
        });
    };
};
exports.createFSSandboxSaga = createFSSandboxSaga;
//# sourceMappingURL=saga.js.map

/***/ }),

/***/ "../fsbox/lib/state.js":
/*!*****************************!*\
  !*** ../fsbox/lib/state.js ***!
  \*****************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getFileCacheItemDataUrl = exports.updateFileCacheItem = exports.hasFileCacheItem = exports.getFileCacheItemsByMimetype = exports.fsCacheBusy = exports.queueSaveFile = exports.isSvgUri = exports.isImageUri = exports.getFSItem = exports.queueOpenFiles = exports.queueOpenFile = exports.FileCacheItemStatus = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var mime = __webpack_require__(/*! mime-types */ "../../node_modules/mime-types/index.js");
var FileCacheItemStatus;
(function (FileCacheItemStatus) {
    FileCacheItemStatus[FileCacheItemStatus["CREATED"] = 0] = "CREATED";
    FileCacheItemStatus[FileCacheItemStatus["LOADING"] = 1] = "LOADING";
    FileCacheItemStatus[FileCacheItemStatus["LOADED"] = 2] = "LOADED";
    FileCacheItemStatus[FileCacheItemStatus["SAVE_REQUESTED"] = 3] = "SAVE_REQUESTED";
    FileCacheItemStatus[FileCacheItemStatus["SAVING"] = 4] = "SAVING";
})(FileCacheItemStatus = exports.FileCacheItemStatus || (exports.FileCacheItemStatus = {}));
var queueOpenFile = function (uri, state) {
    var _a;
    // should always create new file for queueOpen since reducer
    // code may depend on newly loaded content
    return __assign(__assign({}, state), { fileCache: __assign(__assign({}, state.fileCache), (_a = {}, _a[uri] = createFileCacheItem(uri), _a)) });
};
exports.queueOpenFile = queueOpenFile;
var queueOpenFiles = function (uris, state) { return uris.reduce(function (state, uri) { return (0, exports.queueOpenFile)(uri, state); }, state); };
exports.queueOpenFiles = queueOpenFiles;
var getFSItem = function (uri, state) {
    return state.fileCache[uri];
};
exports.getFSItem = getFSItem;
var isImageUri = function (uri) {
    return /^image\//.test(mime.lookup(uri) || "");
};
exports.isImageUri = isImageUri;
var isSvgUri = function (uri) { return /\.svg$/.test(uri); };
exports.isSvgUri = isSvgUri;
var queueSaveFile = function (uri, state) {
    return (0, exports.updateFileCacheItem)({ status: FileCacheItemStatus.SAVE_REQUESTED }, uri, state);
};
exports.queueSaveFile = queueSaveFile;
exports.fsCacheBusy = (0, tandem_common_1.memoize)(function (fileCache) {
    return Object.values(fileCache).some(function (item) { return item.status !== FileCacheItemStatus.LOADED; });
});
var getFileCacheItemsByMimetype = function (mimeType, state) {
    var items = [];
    for (var uri in state) {
        var item = state[uri];
        if (item.mimeType === mimeType) {
            items.push(item);
        }
    }
    return items;
};
exports.getFileCacheItemsByMimetype = getFileCacheItemsByMimetype;
var hasFileCacheItem = function (uri, state) {
    return Boolean(state.fileCache[uri]);
};
exports.hasFileCacheItem = hasFileCacheItem;
var updateFileCacheItem = function (properties, uri, state) {
    var _a;
    return (__assign(__assign({}, state), { fileCache: __assign(__assign({}, state.fileCache), (_a = {}, _a[uri] = __assign(__assign(__assign({}, state.fileCache[uri]), properties), { dirty: state.fileCache[uri].dirty || Boolean(properties.content) }), _a)) }));
};
exports.updateFileCacheItem = updateFileCacheItem;
var createFileCacheItem = function (uri) { return ({
    uri: uri,
    status: FileCacheItemStatus.CREATED,
    content: null,
    mimeType: null
}); };
exports.getFileCacheItemDataUrl = (0, tandem_common_1.memoize)(function (_a) {
    var mimeType = _a.mimeType, content = _a.content;
    return "data:".concat(mimeType, ";base64, ").concat(content.toString("base64"));
});
//# sourceMappingURL=state.js.map

/***/ }),

/***/ "../paperclip-migrator/000-001.js":
/*!****************************************!*\
  !*** ../paperclip-migrator/000-001.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { merge } = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");

module.exports = (module) => {
  return merge({}, module, {
    id: module.id || (Math.round(Math.random() * 9999999999) + "." + Date.now()),
    version: "0.0.1",
    children: module.children && module.children.map(mapModuleChild) || []
  });
}

const mapModuleChild = (child) => {
  if (child.name === "component") {
    return mapComponent(child);
  }
  return child;
}

const mapComponent = (component) => merge({}, component, {
  attributes: {
    core: {
      name: component.attributes.core.id,
      id: null
    }
  }
});

/***/ }),

/***/ "../paperclip-migrator/001-002.js":
/*!****************************************!*\
  !*** ../paperclip-migrator/001-002.js ***!
  \****************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const { generateUID } = __webpack_require__(/*! tandem-common */ "../common/index.js");
const { merge, values } = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");

module.exports = (module) => {
  const mapModule = ({ id, attributes, children }) => ({
    id: id,
    name: "module",
    imports: attributes && values(attributes.xmlns || {}) || [],
    version: "0.0.2",
    children: children.map(mapModuleChild)
  });

  const mapModuleChild = (child) => {
    return {
      id: generateUID(),
      name: "frame",
      bounds: child.attributes.editor && child.attributes.editor.bounds,
      children: [mapFrameChild(child)]
    };
  }

  const mapFrameChild = (child) => {
    switch(child.name) {
      case "component": return mapComponent(child);
      default: mapVisibleNode(child);
    }
  };

  const mapComponent = ({ id, attributes, children }) => ({
    id,
    name: "component",
    is: "div",
    style: {},
    attributes: {},
    label: attributes.core.label,
    container: attributes.core.container,
    children: children[0].children.map(mapVisibleNode)
  });

  const getComponentInstanceId = (componentName) => {
    const component = module.children.find(component => component.attributes.core.name === componentName);
    return component && component.id;
  }

  const mapVisibleNode = (node) => {
    switch(node.name) {
      case "element": return mapElement(node);
      case "text": return mapText(node);
      default: return mapComponentInstance(node);
    }
  };

  const mapElement = ({ id, name, attributes, children }) => ({
    id,
    name: "element",
    label: attributes.core.label,
    style: attributes.core.style || {},
    slot: attributes.core.slot,
    container: attributes.core.container,
    attributes: {},
    is: attributes.core.nativeType && attributes.core.nativeType !== "element" ? attributes.core.nativeType : "div",
    children: children.map(mapVisibleNode)
  });

  const mapText = ({ id, name, attributes }) => ({
    id,
    name: "text",
    label: attributes.core.label,
    value: attributes.core.value,
    style: attributes.core.style || {},
    children: []
  });

  const mapComponentInstance = ({ id, name, attributes, children }) => ({
    id,
    name: "component-instance",
    is: getComponentInstanceId(name) || name,
    variant: [],
    style: attributes.core.style,
    container: attributes.core.container,
    children: children.map(mapVisibleNode)
  });

  return mapModule(module);
}

/***/ }),

/***/ "../paperclip-migrator/002-003.js":
/*!****************************************!*\
  !*** ../paperclip-migrator/002-003.js ***!
  \****************************************/
/***/ ((module) => {

module.exports = (module) => {

  const mapModule = (module) => {
    return {
      id: module.id,
      version: "0.0.3",
      metadata: {},
      name: "module",
      children: module.children.map(mapFrame)
    };
  };

  const mapFrame = (frame) => {
    const firstChild = mapNode(frame.children[0]);
    return Object.assign({}, firstChild, {
      metadata: {
        bounds: frame.bounds
      }
    });
  };

  const mapNode = (node) => Object.assign({}, node, {
    metadata: {},
    attributes: node.attributes || {},
    children: node.children.map(mapNode)
  });

  return mapModule(module);
};


/***/ }),

/***/ "../paperclip-migrator/003-004.js":
/*!****************************************!*\
  !*** ../paperclip-migrator/003-004.js ***!
  \****************************************/
/***/ ((module) => {

module.exports = (module) => {
  const mapModule = (module) => {
    return {
      id: module.id,
      version: "0.0.4",
      metadata: {},
      name: "module",
      children: module.children.map(mapNode).filter(Boolean)
    };
  };

  const mapNode = (node) => {
    if (node.name === "override" && node.propertyName === "label") {
      return null;
    }

    return Object.assign({}, node, {
      children: node.children.map(mapNode).filter(Boolean)
    });
  };

  return mapModule(module);
};


/***/ }),

/***/ "../paperclip-migrator/004-005.js":
/*!****************************************!*\
  !*** ../paperclip-migrator/004-005.js ***!
  \****************************************/
/***/ ((module) => {

module.exports = (module) => {
  const mapModule = (module) => {
    return {
      id: module.id,
      version: "0.0.5",
      metadata: {},
      name: "module",
      children: module.children.map(mapNode)
    };
  };

  const mapNode = (node) => {
    if (node.name === "component-instance" || node.name === "component") {
      return Object.assign({}, node, {
        variant: node.variant || {}
      });
    }

    return node;
  };

  return mapModule(module);
};


/***/ }),

/***/ "../paperclip-migrator/005-006.js":
/*!****************************************!*\
  !*** ../paperclip-migrator/005-006.js ***!
  \****************************************/
/***/ ((module) => {

module.exports = (module) => {
  const mapModule = (module) => {
    return {
      id: module.id,
      version: "0.0.6",
      metadata: {},
      name: "module",
      children: module.children.map(mapNode)
    };
  };

  const mapNode = (node) => {
    if (node.name === "media-query") {
      return {
        id: node.id,
        children: node.children,
        metadata: node.metadata,
        label: node.label,
        name: "query",
        type: 0,
        condition: {
          minWidth: node.minWidth,
          maxWidth: node.maxWidth
        }
      }
    }

    if (node.name === "variant-trigger" && node.source && node.source.type === 0) {
      return {
        id: node.id,
        children: node.children,
        metadata: node.metadata,
        label: node.label,
        name: "variant-trigger",
        targetVariantId: node.targetVariantId,
        source: {
          type: 0,
          queryId: node.source.mediaQueryId
        }
      }
    }

    return Object.assign({}, node, {
      children: node.children.map(mapNode)
    });
  };

  return mapModule(module);
};


/***/ }),

/***/ "../paperclip-migrator/index.js":
/*!**************************************!*\
  !*** ../paperclip-migrator/index.js ***!
  \**************************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

const _000_001 = __webpack_require__(/*! ./000-001 */ "../paperclip-migrator/000-001.js");
const _001_002 = __webpack_require__(/*! ./001-002 */ "../paperclip-migrator/001-002.js");
const _002_003 = __webpack_require__(/*! ./002-003 */ "../paperclip-migrator/002-003.js");
const _003_004 = __webpack_require__(/*! ./003-004 */ "../paperclip-migrator/003-004.js");
const _004_005 = __webpack_require__(/*! ./004-005 */ "../paperclip-migrator/004-005.js");
const _005_006 = __webpack_require__(/*! ./005-006 */ "../paperclip-migrator/005-006.js");

const migrators = {
  "0.0.0": _000_001,
  "0.0.1": _001_002,
  "0.0.2": _002_003,
  "0.0.3": _003_004,
  "0.0.4": _004_005,
  "0.0.5": _005_006
};

module.exports = (oldModule) => {
  const migrate = migrators[oldModule.version || "0.0.0"];
  return migrate ? module.exports(migrate(oldModule)) : oldModule;
};


/***/ }),

/***/ "../paperclip/index.js":
/*!*****************************!*\
  !*** ../paperclip/index.js ***!
  \*****************************/
/***/ ((module, __unused_webpack_exports, __webpack_require__) => {

module.exports = __webpack_require__(/*! ./lib */ "../paperclip/lib/index.js");

/***/ }),

/***/ "../paperclip/lib/actions.js":
/*!***********************************!*\
  !*** ../paperclip/lib/actions.js ***!
  \***********************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.pcRuntimeEvaluated = exports.pcFrameContainerCreated = exports.pcSourceFileUrisReceived = exports.pcDependencyGraphLoaded = exports.pcFrameRendered = exports.PC_RUNTIME_EVALUATED = exports.PC_SYNTHETIC_FRAME_CONTAINER_CREATED = exports.PC_SOURCE_FILE_URIS_RECEIVED = exports.PC_DEPENDENCY_GRAPH_LOADED = exports.PC_SYNTHETIC_FRAME_RENDERED = void 0;
exports.PC_SYNTHETIC_FRAME_RENDERED = "PC_SYNTHETIC_FRAME_RENDERED";
exports.PC_DEPENDENCY_GRAPH_LOADED = "PC_DEPENDENCY_GRAPH_LOADED";
exports.PC_SOURCE_FILE_URIS_RECEIVED = "PC_SOURCE_FILE_URIS_RECEIVED";
exports.PC_SYNTHETIC_FRAME_CONTAINER_CREATED = "PC_SYNTHETIC_FRAME_CONTAINER_CREATED";
exports.PC_RUNTIME_EVALUATED = "PC_RUNTIME_EVALUATED";
var pcFrameRendered = function (frame, computed) { return ({
    type: exports.PC_SYNTHETIC_FRAME_RENDERED,
    frame: frame,
    computed: computed
}); };
exports.pcFrameRendered = pcFrameRendered;
var pcDependencyGraphLoaded = function (graph) { return ({
    graph: graph,
    type: exports.PC_DEPENDENCY_GRAPH_LOADED
}); };
exports.pcDependencyGraphLoaded = pcDependencyGraphLoaded;
var pcSourceFileUrisReceived = function (uris) { return ({
    uris: uris,
    type: exports.PC_SOURCE_FILE_URIS_RECEIVED
}); };
exports.pcSourceFileUrisReceived = pcSourceFileUrisReceived;
var pcFrameContainerCreated = function (frame, $container) { return ({
    frame: frame,
    $container: $container,
    type: exports.PC_SYNTHETIC_FRAME_CONTAINER_CREATED
}); };
exports.pcFrameContainerCreated = pcFrameContainerCreated;
var pcRuntimeEvaluated = function (newDocuments, diffs, allDocuments, catchingUp) { return ({
    newDocuments: newDocuments,
    diffs: diffs,
    catchingUp: catchingUp,
    allDocuments: allDocuments,
    type: exports.PC_RUNTIME_EVALUATED
}); };
exports.pcRuntimeEvaluated = pcRuntimeEvaluated;
//# sourceMappingURL=actions.js.map

/***/ }),

/***/ "../paperclip/lib/config.js":
/*!**********************************!*\
  !*** ../paperclip/lib/config.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadFSDependencyGraphSync = exports.walkPCRootDirectory = exports.findPaperclipSourceFiles = exports.openPCConfig = exports.DEFAULT_CONFIG = exports.createPCConfig = void 0;
var fs = __webpack_require__(/*! fs */ "?3d43");
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var graph_1 = __webpack_require__(/*! ./graph */ "../paperclip/lib/graph.js");
var constants_1 = __webpack_require__(/*! ./constants */ "../paperclip/lib/constants.js");
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
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

/***/ }),

/***/ "../paperclip/lib/constants.js":
/*!*************************************!*\
  !*** ../paperclip/lib/constants.js ***!
  \*************************************/
/***/ ((__unused_webpack_module, exports) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.PAPERCLIP_CONFIG_DEFAULT_EXTENSION = exports.PAPERCLIP_DEFAULT_EXTENSIONS = exports.PAPERCLIP_MIME_TYPE = void 0;
exports.PAPERCLIP_MIME_TYPE = "application/paperclip";
exports.PAPERCLIP_DEFAULT_EXTENSIONS = [".pc"];
exports.PAPERCLIP_CONFIG_DEFAULT_EXTENSION = ".tdproject";
//# sourceMappingURL=constants.js.map

/***/ }),

/***/ "../paperclip/lib/dom-renderer.js":
/*!****************************************!*\
  !*** ../paperclip/lib/dom-renderer.js ***!
  \****************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patchDOM = exports.computeDisplayInfo = exports.waitForDOMReady = exports.renderDOM = void 0;
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var ot_1 = __webpack_require__(/*! ./ot */ "../paperclip/lib/ot.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var SVG_XMLNS = "http://www.w3.org/2000/svg";
var renderDOM = function (native, synthetic, document) {
    if (document === void 0) { document = window.document; }
    while (native.childNodes.length) {
        native.removeChild(native.childNodes[0]);
    }
    var nativeMap = {};
    // Not ethat we cannot render directly to the element passed in
    // since we need to assume that its type is immutable (like body)
    // applySyntheticNodeProps(native, synthetic, nativeMap, true);
    native.appendChild(createNativeNode(synthetic, document, nativeMap, true));
    return nativeMap;
};
exports.renderDOM = renderDOM;
var waitForDOMReady = function (map) {
    var loadableElements = Object.values(map).filter(function (element) {
        return /img/.test(element.nodeName);
    });
    return Promise.all(loadableElements.map(function (element) {
        return new Promise(function (resolve) {
            element.onload = resolve;
        });
    }));
};
exports.waitForDOMReady = waitForDOMReady;
var computeDisplayInfo = function (map) {
    var computed = {};
    for (var id in map) {
        var node = map[id];
        var rect = node.getBoundingClientRect();
        if (node.nodeType === 1) {
            computed[id] = {
                style: window.getComputedStyle(node),
                bounds: {
                    left: rect.left,
                    top: rect.top,
                    right: rect.right,
                    bottom: rect.bottom
                }
            };
        }
    }
    return computed;
};
exports.computeDisplayInfo = computeDisplayInfo;
var setStyleConstraintsIfRoot = function (synthetic, nativeElement, isContentNode) {
    if (isContentNode) {
        nativeElement.style.position = "fixed";
        if (nativeElement.tagName === "SPAN") {
            nativeElement.style.display = "block";
        }
        nativeElement.style.top = "0px";
        nativeElement.style.left = "0px";
        nativeElement.style.width = "100%";
        nativeElement.style.height = "100%";
        nativeElement.style.minHeight = "unset";
        nativeElement.style.minWidth = "unset";
        nativeElement.style.maxWidth = "unset";
        nativeElement.style.maxHeight = "unset";
        nativeElement.style.boxSizing = "border-box";
    }
};
var setAttribute = function (target, name, value) {
    if (name === "style") {
        console.warn("\"style\" attribute present in attributes.");
        return;
    }
    if (name.indexOf(":") !== -1) {
        var _a = name.split(":"), xmlns = _a[0], key = _a[1];
        target.setAttributeNS(xmlns, key, value);
    }
    else {
        target.setAttribute(name, value);
    }
};
var SVG_STYlE_KEY_MAP = {
    background: "fill"
};
var setStyle = function (target, style) {
    var normalizedStyle = normalizeStyle(style);
    var cstyle;
    if (target.namespaceURI === SVG_XMLNS) {
        cstyle = {};
        for (var key in normalizedStyle) {
            cstyle[SVG_STYlE_KEY_MAP[key] || key] = normalizedStyle[key];
        }
    }
    else {
        cstyle = normalizedStyle;
    }
    Object.assign(target.style, cstyle);
};
var createNativeNode = function (synthetic, document, map, isContentNode, xmlns) {
    var isText = synthetic.name === dsl_1.PCSourceTagNames.TEXT;
    var attrs = synthetic.attributes || tandem_common_1.EMPTY_OBJECT;
    var tagName = isText
        ? "span"
        : synthetic.name || "div";
    if (attrs.xmlns) {
        xmlns = attrs.xmlns;
    }
    var nativeElement = (xmlns
        ? document.createElementNS(xmlns, tagName)
        : document.createElement(tagName));
    applySyntheticNodeProps(nativeElement, synthetic, map, isContentNode, nativeElement.namespaceURI);
    return (map[synthetic.id] = nativeElement);
};
var applySyntheticNodeProps = function (nativeElement, synthetic, map, isContentNode, xmlns) {
    var isText = synthetic.name === dsl_1.PCSourceTagNames.TEXT;
    var attrs = synthetic.attributes || tandem_common_1.EMPTY_OBJECT;
    for (var name_1 in attrs) {
        setAttribute(nativeElement, name_1, attrs[name_1]);
    }
    if (synthetic.style) {
        setStyle(nativeElement, synthetic.style);
    }
    setStyleConstraintsIfRoot(synthetic, nativeElement, isContentNode);
    if (isText) {
        nativeElement.appendChild(document.createTextNode(synthetic.value));
    }
    else {
        for (var i = 0, length_1 = synthetic.children.length; i < length_1; i++) {
            var childSynthetic = synthetic.children[i];
            nativeElement.appendChild(createNativeNode(childSynthetic, document, map, false, xmlns));
        }
    }
    makeElementClickable(nativeElement, synthetic, isContentNode);
    return (map[synthetic.id] = nativeElement);
};
var removeElementsFromMap = function (synthetic, map) {
    map[synthetic.id] = undefined;
    for (var i = 0, length_2 = synthetic.children.length; i < length_2; i++) {
        removeElementsFromMap(synthetic, map);
    }
};
var patchDOM = function (transforms, synthetic, root, map) {
    var newMap = map;
    var newSyntheticTree = synthetic;
    for (var _i = 0, transforms_1 = transforms; _i < transforms_1.length; _i++) {
        var transform = transforms_1[_i];
        var oldSyntheticTarget = (0, tandem_common_1.getTreeNodeFromPath)(transform.nodePath, newSyntheticTree);
        var isContentNode = transform.nodePath.length === 0;
        var target = newMap[oldSyntheticTarget.id];
        newSyntheticTree = (0, ot_1.patchTreeNode)([transform], newSyntheticTree);
        var syntheticTarget = (0, tandem_common_1.getTreeNodeFromPath)(transform.nodePath, newSyntheticTree);
        switch (transform.type) {
            case ot_1.TreeNodeOperationalTransformType.SET_PROPERTY: {
                var _a = transform, name_2 = _a.name, value = _a.value;
                if (name_2 === "style") {
                    resetElementStyle(target, syntheticTarget);
                    setStyleConstraintsIfRoot(syntheticTarget, target, isContentNode);
                    makeElementClickable(target, syntheticTarget, isContentNode);
                }
                else if (name_2 === "attributes") {
                    for (var key in value) {
                        if (!value[key]) {
                            target.removeAttribute(key);
                        }
                        else {
                            setAttribute(target, key, value[key]);
                        }
                    }
                }
                else if (name_2 === "name") {
                    var parent_1 = target.parentNode;
                    if (newMap === map) {
                        newMap = __assign({}, map);
                    }
                    var xmlnsTransform = transforms.find(function (transform) {
                        return transform.type ===
                            ot_1.TreeNodeOperationalTransformType.SET_PROPERTY &&
                            transform.name === "attributes" &&
                            transform.value.xmlns;
                    });
                    var newTarget = createNativeNode((0, tandem_common_1.getTreeNodeFromPath)(transform.nodePath, newSyntheticTree), root.ownerDocument, newMap, isContentNode, xmlnsTransform && xmlnsTransform.value.xmlns);
                    parent_1.insertBefore(newTarget, target);
                    parent_1.removeChild(target);
                }
                else if (syntheticTarget.name === "text" && name_2 === "value") {
                    target.childNodes[0].nodeValue = value;
                }
                break;
            }
            case ot_1.TreeNodeOperationalTransformType.INSERT_CHILD: {
                var _b = transform, child = _b.child, index = _b.index;
                if (newMap === map) {
                    newMap = __assign({}, map);
                }
                var nativeChild = createNativeNode(child, root.ownerDocument, newMap, false, target.namespaceURI);
                removeClickableStyle(target, syntheticTarget);
                insertChild(target, nativeChild, index);
                break;
            }
            case ot_1.TreeNodeOperationalTransformType.REMOVE_CHILD: {
                var index = transform.index;
                target.removeChild(target.childNodes[index]);
                if (target.childNodes.length === 0) {
                    makeElementClickable(target, syntheticTarget, isContentNode);
                }
                break;
            }
            case ot_1.TreeNodeOperationalTransformType.MOVE_CHILD: {
                var _c = transform, oldIndex = _c.oldIndex, newIndex = _c.newIndex;
                var child = target.childNodes[oldIndex];
                target.removeChild(child);
                insertChild(target, child, newIndex);
                break;
            }
            default: {
                throw new Error("OT not supported yet");
            }
        }
    }
    return newMap;
};
exports.patchDOM = patchDOM;
var EMPTY_ELEMENT_STYLE_NAMES = [
    "box-sizing",
    "display",
    "background",
    "background-image",
    "font-family",
    "font-weight",
    "white-space",
    "position",
    "text-decoration",
    "letter-spacing",
    "color",
    "border-radius",
    "box-sizing",
    "box-shadow",
    "border-top-left-radius",
    "border-top-right-radius",
    "border-bottom-left-radius",
    "border-bottom-right-radius",
    "border-left",
    "border-right",
    "border-top",
    "border-bottom",
    "line-height",
    "font-size",
    "text-alignment"
];
var stripEmptyElement = (0, tandem_common_1.memoize)(function (style) {
    return (0, lodash_1.omit)(style, EMPTY_ELEMENT_STYLE_NAMES);
});
var makeElementClickable = function (target, synthetic, isContentNode) {
    if (synthetic.name === "div" && !isContentNode) {
        var style = synthetic.style || tandem_common_1.EMPTY_OBJECT;
        if (target.childNodes.length === 0 &&
            Object.keys(stripEmptyElement(style)).length === 0) {
            target.dataset.empty = "1";
            Object.assign(target.style, {
                width: "100%",
                height: "50px",
                minWidth: "50px",
                border: "2px dashed rgba(0,0,0,0.05)",
                boxSizing: "border-box",
                borderRadius: "2px",
                position: "relative"
            });
            var placeholder = document.createElement("div");
            Object.assign(placeholder.style, {
                left: "50%",
                top: "50%",
                position: "absolute",
                transform: "translate(-50%, -50%)",
                color: "rgba(0,0,0,0.05)",
                fontFamily: "Helvetica"
            });
            placeholder.textContent = "Empty element";
            target.appendChild(placeholder);
        }
    }
};
var resetElementStyle = function (target, synthetic) {
    if (target.namespaceURI === SVG_XMLNS) {
        target.setAttribute("style", "");
    }
    else {
        removeClickableStyle(target, synthetic);
        target.setAttribute("style", "");
        if (target.tagName === "BODY") {
            target.style.margin = "0px";
        }
    }
    setStyle(target, synthetic.style || tandem_common_1.EMPTY_OBJECT);
};
var removeClickableStyle = function (target, synthetic) {
    if (target.dataset.empty === "1") {
        target.dataset.empty = null;
        target.innerHTML = "";
        resetElementStyle(target, synthetic);
    }
};
var insertChild = function (target, child, index) {
    if (index < target.childNodes.length) {
        target.insertBefore(child, target.childNodes[index]);
    }
    else {
        target.appendChild(child);
    }
};
var normalizeStyle = function (value) {
    return (0, lodash_1.mapValues)(value, function (value, key) {
        if (/width|height|left|top|right|bottom|margin|padding|font-size|radius/.test(key) &&
            !isNaN(Number(value))) {
            return "".concat(value, "px");
        }
        return value;
    });
};
//# sourceMappingURL=dom-renderer.js.map

/***/ }),

/***/ "../paperclip/lib/dsl.js":
/*!*******************************!*\
  !*** ../paperclip/lib/dsl.js ***!
  \*******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.getGlobalVariables = exports.getPCNodeDependency = exports.getNativeComponentName = exports.getPCImportedChildrenSourceUris = exports.getPCVariantOverrides = exports.getPCVariants = exports.getOverrides = exports.getVisibleOrSlotChildren = exports.getVisibleChildren = exports.getModuleComponents = exports.isElementLikePCNode = exports.isTextLikePCNode = exports.extendsComponent = exports.isPCComponentOrInstance = exports.isPCComponentInstance = exports.isPCPlug = exports.isSlot = exports.isComponent = exports.isPCOverride = exports.isVisibleNode = exports.isValueOverride = exports.createPCDependency = exports.createPCOverride = exports.createPCPlug = exports.createPCSlot = exports.createPCTextNode = exports.createPCComponentInstance = exports.createPCElement = exports.createPCVariable = exports.createPCVariantTrigger = exports.createPCQuery = exports.createPCVariant = exports.createPCElementStyleMixin = exports.createPCTextStyleMixin = exports.getDerrivedPCLabel = exports.createPCComponent = exports.createPCModule = exports.PCElementState = exports.PCVariantTriggerSourceType = exports.PCVariableType = exports.PCQueryType = exports.COMPUTED_OVERRIDE_DEFAULT_KEY = exports.PCVisibleNodeMetadataKey = exports.CSS_COLOR_ALIASES = exports.INHERITABLE_STYLE_NAMES = exports.TEXT_STYLE_NAMES = exports.VOID_TAG_NAMES = exports.PCOverridablePropertyName = exports.PCSourceTagNames = exports.PAPERCLIP_MODULE_VERSION = void 0;
exports.replacePCNode = exports.flattenPCOverrideMap = exports.mergeVariantOverrides = exports.getOverrideMap = exports.filterNestedOverrides = exports.getNodeStyleRefIds = exports.computeStyleValue = exports.computeStyleWithVars = exports.getCSSVars = exports.styleValueContainsCSSVar = exports.getPCParentComponentInstances = exports.getVariableGraphRefs = exports.getQueryGraphRefs = exports.getAllVariableRefMap = exports.getQueryRefMap = exports.getVariableRefMap = exports.getComponentGraphRefMap = exports.pcNodeEquals = exports.getComponentGraphRefs = exports.computePCNodeStyle = exports.variableQueryPassed = exports.isVariantTriggered = exports.getSortedStyleMixinIds = exports.getComponentRefIds = exports.isVoidTagName = exports.getAllStyleMixins = exports.getAllPCComponents = exports.getNodeSourceComponent = exports.getDefaultVariantIds = exports.getComponentVariants = exports.getComponentTemplate = exports.updatePCNodeMetadata = exports.getPCNodeContentNode = exports.getPCNodeModule = exports.isPCContentNode = exports.filterPCNodes = exports.getPCNode = exports.getInstanceExtends = exports.getSlotPlug = exports.getInstanceShadow = exports.addPCNodePropertyBinding = exports.getInstanceSlotContent = exports.getVariantTriggers = exports.getComponentVariantTriggers = exports.getComponentSlots = exports.getInstanceSlots = exports.filterVariablesByType = exports.getGlobalMediaQueries = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var graph_1 = __webpack_require__(/*! ./graph */ "../paperclip/lib/graph.js");
exports.PAPERCLIP_MODULE_VERSION = "0.0.6";
/*------------------------------------------
 * CONSTANTS
 *-----------------------------------------*/
var PCSourceTagNames;
(function (PCSourceTagNames) {
    // the root node which contains all pc nodes
    PCSourceTagNames["MODULE"] = "module";
    // components are living UI that are exported to application code
    PCSourceTagNames["COMPONENT"] = "component";
    // Style mixins define re-usable groups of styles, and nested styles. Maybe
    // this later on: https://css-tricks.com/part-theme-explainer/
    PCSourceTagNames["STYLE_MIXIN"] = "style-mixin";
    // Variables define a single value (like colors) that can be used in any style property (and attributes later on)
    PCSourceTagNames["VARIABLE"] = "variable";
    PCSourceTagNames["ELEMENT"] = "element";
    PCSourceTagNames["COMPONENT_INSTANCE"] = "component-instance";
    PCSourceTagNames["VARIANT"] = "variant";
    PCSourceTagNames["VARIANT_TRIGGER"] = "variant-trigger";
    // Slots are sections of components where text & elements can be inserted into
    PCSourceTagNames["SLOT"] = "slot";
    PCSourceTagNames["QUERY"] = "query";
    // Plugs provide content for slots
    PCSourceTagNames["PLUG"] = "plug";
    // An override is a node that overrides a specific property or style within a variant, or shadow.
    PCSourceTagNames["OVERRIDE"] = "override";
    PCSourceTagNames["TEXT"] = "text";
    // TOD
    PCSourceTagNames["INHERIT_STYLE"] = "inherit-style";
})(PCSourceTagNames = exports.PCSourceTagNames || (exports.PCSourceTagNames = {}));
var PCOverridablePropertyName;
(function (PCOverridablePropertyName) {
    PCOverridablePropertyName["TEXT"] = "text";
    PCOverridablePropertyName["CHILDREN"] = "children";
    PCOverridablePropertyName["INHERIT_STYLE"] = "styleMixins";
    // DEPRECATED
    PCOverridablePropertyName["VARIANT_IS_DEFAULT"] = "isDefault";
    PCOverridablePropertyName["VARIANT"] = "variant";
    PCOverridablePropertyName["STYLE"] = "style";
    PCOverridablePropertyName["ATTRIBUTES"] = "attributes";
    PCOverridablePropertyName["LABEL"] = "label";
    PCOverridablePropertyName["SLOT"] = "slot";
    PCOverridablePropertyName["CONTENT"] = "content";
})(PCOverridablePropertyName = exports.PCOverridablePropertyName || (exports.PCOverridablePropertyName = {}));
exports.VOID_TAG_NAMES = [
    "area",
    "base",
    "basefont",
    "bgsound",
    "br",
    "col",
    "command",
    "embed",
    "frame",
    "hr",
    "image",
    "img",
    "input",
    "isindex",
    "keygen",
    "link",
    "menuitem",
    "meta",
    "nextid",
    "param",
    "source",
    "track",
    "wbr"
];
exports.TEXT_STYLE_NAMES = [
    "font-family",
    "font-size",
    "font-style",
    "font-variant",
    "font-weight",
    "letter-spacing",
    "font",
    "color",
    "text-align",
    "text-indent",
    "line-height",
    "text-transform",
    "word-spacing",
    "white-space"
];
exports.INHERITABLE_STYLE_NAMES = __spreadArray(__spreadArray([], exports.TEXT_STYLE_NAMES, true), [
    "azimuth",
    "border-collapse",
    "border-spacing",
    "caption-side",
    "cursor",
    "direction",
    "elevation",
    "empty-cells",
    "list-style-image",
    "list-style-position",
    "list-style-type",
    "list-style",
    "orphans",
    "pitch-range",
    "pitch",
    "quotes",
    "richness",
    "speak-header",
    "speak-numeral",
    "speak-punctuation",
    "speak",
    "speech-rate",
    "stress",
    "visibility",
    "voice-family",
    "volume",
    "widows"
], false);
exports.CSS_COLOR_ALIASES = {
    aliceblue: "#F0F8FF",
    antiquewhite: "#FAEBD7",
    aqua: "#00FFFF",
    aquamarine: "#7FFFD4",
    azure: "#F0FFFF",
    beige: "#F5F5DC",
    bisque: "#FFE4C4",
    black: "#000000",
    blanchedalmond: "#FFEBCD",
    blue: "#0000FF",
    blueviolet: "#8A2BE2",
    brown: "#A52A2A",
    burlywood: "#DEB887",
    cadetblue: "#5F9EA0",
    chartreuse: "#7FFF00",
    chocolate: "#D2691E",
    coral: "#FF7F50",
    cornflowerblue: "#6495ED",
    cornsilk: "#FFF8DC",
    crimson: "#DC143C",
    cyan: "#00FFFF",
    darkblue: "#00008B",
    darkcyan: "#008B8B",
    darkgoldenrod: "#B8860B",
    darkgray: "#A9A9A9",
    darkgrey: "#A9A9A9",
    darkgreen: "#006400",
    darkkhaki: "#BDB76B",
    darkmagenta: "#8B008B",
    darkolivegreen: "#556B2F",
    darkorange: "#FF8C00",
    darkorchid: "#9932CC",
    darkred: "#8B0000",
    darksalmon: "#E9967A",
    darkseagreen: "#8FBC8F",
    darkslateblue: "#483D8B",
    darkslategray: "#2F4F4F",
    darkslategrey: "#2F4F4F",
    darkturquoise: "#00CED1",
    darkviolet: "#9400D3",
    deeppink: "#FF1493",
    deepskyblue: "#00BFFF",
    dimgray: "#696969",
    dimgrey: "#696969",
    dodgerblue: "#1E90FF",
    firebrick: "#B22222",
    floralwhite: "#FFFAF0",
    forestgreen: "#228B22",
    fuchsia: "#FF00FF",
    gainsboro: "#DCDCDC",
    ghostwhite: "#F8F8FF",
    gold: "#FFD700",
    goldenrod: "#DAA520",
    gray: "#808080",
    grey: "#808080",
    green: "#008000",
    greenyellow: "#ADFF2F",
    honeydew: "#F0FFF0",
    hotpink: "#FF69B4",
    "indianred ": "#CD5C5C",
    "indigo  ": "#4B0082",
    ivory: "#FFFFF0",
    khaki: "#F0E68C",
    lavender: "#E6E6FA",
    lavenderblush: "#FFF0F5",
    lawngreen: "#7CFC00",
    lemonchiffon: "#FFFACD",
    lightblue: "#ADD8E6",
    lightcoral: "#F08080",
    lightcyan: "#E0FFFF",
    lightgoldenrodyellow: "#FAFAD2",
    lightgray: "#D3D3D3",
    lightgrey: "#D3D3D3",
    lightgreen: "#90EE90",
    lightpink: "#FFB6C1",
    lightsalmon: "#FFA07A",
    lightseagreen: "#20B2AA",
    lightskyblue: "#87CEFA",
    lightslategray: "#778899",
    lightslategrey: "#778899",
    lightsteelblue: "#B0C4DE",
    lightyellow: "#FFFFE0",
    lime: "#00FF00",
    limegreen: "#32CD32",
    linen: "#FAF0E6",
    magenta: "#FF00FF",
    maroon: "#800000",
    mediumaquamarine: "#66CDAA",
    mediumblue: "#0000CD",
    mediumorchid: "#BA55D3",
    mediumpurple: "#9370DB",
    mediumseagreen: "#3CB371",
    mediumslateblue: "#7B68EE",
    mediumspringgreen: "#00FA9A",
    mediumturquoise: "#48D1CC",
    mediumvioletred: "#C71585",
    midnightblue: "#191970",
    mintcream: "#F5FFFA",
    mistyrose: "#FFE4E1",
    moccasin: "#FFE4B5",
    navajowhite: "#FFDEAD",
    navy: "#000080",
    oldlace: "#FDF5E6",
    olive: "#808000",
    olivedrab: "#6B8E23",
    orange: "#FFA500",
    orangered: "#FF4500",
    orchid: "#DA70D6",
    palegoldenrod: "#EEE8AA",
    palegreen: "#98FB98",
    paleturquoise: "#AFEEEE",
    palevioletred: "#DB7093",
    papayawhip: "#FFEFD5",
    peachpuff: "#FFDAB9",
    peru: "#CD853F",
    pink: "#FFC0CB",
    plum: "#DDA0DD",
    powderblue: "#B0E0E6",
    purple: "#800080",
    rebeccapurple: "#663399",
    red: "#FF0000",
    rosybrown: "#BC8F8F",
    royalblue: "#4169E1",
    saddlebrown: "#8B4513",
    salmon: "#FA8072",
    sandybrown: "#F4A460",
    seagreen: "#2E8B57",
    seashell: "#FFF5EE",
    sienna: "#A0522D",
    silver: "#C0C0C0",
    skyblue: "#87CEEB",
    slateblue: "#6A5ACD",
    slategray: "#708090",
    slategrey: "#708090",
    snow: "#FFFAFA",
    springgreen: "#00FF7F",
    steelblue: "#4682B4",
    tan: "#D2B48C",
    teal: "#008080",
    thistle: "#D8BFD8",
    tomato: "#FF6347",
    turquoise: "#40E0D0",
    violet: "#EE82EE",
    wheat: "#F5DEB3",
    white: "#FFFFFF",
    whitesmoke: "#F5F5F5",
    yellow: "#FFFF00",
    yellowgreen: "#9ACD32"
};
var PCVisibleNodeMetadataKey;
(function (PCVisibleNodeMetadataKey) {
    // defined when dropped into the root document
    PCVisibleNodeMetadataKey["BOUNDS"] = "bounds";
})(PCVisibleNodeMetadataKey = exports.PCVisibleNodeMetadataKey || (exports.PCVisibleNodeMetadataKey = {}));
exports.COMPUTED_OVERRIDE_DEFAULT_KEY = "default";
var PCQueryType;
(function (PCQueryType) {
    PCQueryType[PCQueryType["MEDIA"] = 0] = "MEDIA";
    PCQueryType[PCQueryType["VARIABLE"] = 1] = "VARIABLE";
})(PCQueryType = exports.PCQueryType || (exports.PCQueryType = {}));
var PCVariableType;
(function (PCVariableType) {
    PCVariableType["UNIT"] = "unit";
    PCVariableType["TEXT"] = "text";
    PCVariableType["NUMBER"] = "number";
    PCVariableType["COLOR"] = "color";
    PCVariableType["FONT"] = "font";
})(PCVariableType = exports.PCVariableType || (exports.PCVariableType = {}));
var PCVariantTriggerSourceType;
(function (PCVariantTriggerSourceType) {
    PCVariantTriggerSourceType[PCVariantTriggerSourceType["QUERY"] = 0] = "QUERY";
    PCVariantTriggerSourceType[PCVariantTriggerSourceType["STATE"] = 1] = "STATE";
})(PCVariantTriggerSourceType = exports.PCVariantTriggerSourceType || (exports.PCVariantTriggerSourceType = {}));
// https://www.w3schools.com/css/css_pseudo_classes.asp
var PCElementState;
(function (PCElementState) {
    // a
    PCElementState["ACTIVE"] = "active";
    // input
    PCElementState["CHECKED"] = "checked";
    PCElementState["DISABLED"] = "disabled";
    PCElementState["OPTIONAL"] = "optional";
    PCElementState["REQUIRED"] = "required";
    PCElementState["VALID"] = "valid";
    // p
    PCElementState["EMPTY"] = "empty";
    PCElementState["ENABLED"] = "enabled";
    PCElementState["FOCUS"] = "focus";
    PCElementState["HOVER"] = "hover";
    PCElementState["LINK"] = "link";
    PCElementState["VISITED"] = "visited";
})(PCElementState = exports.PCElementState || (exports.PCElementState = {}));
/*------------------------------------------
 * FACTORIES
 *-----------------------------------------*/
var createPCModule = function (children) {
    if (children === void 0) { children = tandem_common_1.EMPTY_ARRAY; }
    return ({
        id: (0, tandem_common_1.generateUID)(),
        name: PCSourceTagNames.MODULE,
        version: exports.PAPERCLIP_MODULE_VERSION,
        children: children,
        metadata: tandem_common_1.EMPTY_OBJECT
    });
};
exports.createPCModule = createPCModule;
var createPCComponent = function (label, is, style, attributes, children, metadata, styleMixins) { return ({
    label: label,
    is: is || "div",
    style: style || tandem_common_1.EMPTY_OBJECT,
    attributes: attributes || tandem_common_1.EMPTY_OBJECT,
    id: (0, tandem_common_1.generateUID)(),
    styleMixins: styleMixins,
    name: PCSourceTagNames.COMPONENT,
    children: children || tandem_common_1.EMPTY_ARRAY,
    metadata: metadata || tandem_common_1.EMPTY_OBJECT,
    variant: tandem_common_1.EMPTY_OBJECT
}); };
exports.createPCComponent = createPCComponent;
var getDerrivedPCLabel = function (node, graph) {
    var label = node.label;
    if (label) {
        return label;
    }
    var current = node;
    while ((0, exports.extendsComponent)(current)) {
        current = (0, exports.getPCNode)(current.is, graph);
        label = current.label;
        if (label) {
            break;
        }
    }
    return label;
};
exports.getDerrivedPCLabel = getDerrivedPCLabel;
var createPCTextStyleMixin = function (style, textValue, styleMixins, label) {
    if (label === void 0) { label = textValue; }
    return ({
        id: (0, tandem_common_1.generateUID)(),
        name: PCSourceTagNames.STYLE_MIXIN,
        label: label,
        style: style,
        styleMixins: styleMixins,
        value: textValue,
        targetType: PCSourceTagNames.TEXT,
        children: tandem_common_1.EMPTY_ARRAY,
        metadata: tandem_common_1.EMPTY_OBJECT
    });
};
exports.createPCTextStyleMixin = createPCTextStyleMixin;
var createPCElementStyleMixin = function (style, styleMixins, label) { return ({
    id: (0, tandem_common_1.generateUID)(),
    label: label,
    name: PCSourceTagNames.STYLE_MIXIN,
    style: style,
    styleMixins: styleMixins,
    targetType: PCSourceTagNames.ELEMENT,
    children: tandem_common_1.EMPTY_ARRAY,
    metadata: tandem_common_1.EMPTY_OBJECT
}); };
exports.createPCElementStyleMixin = createPCElementStyleMixin;
var createPCVariant = function (label, isDefault) { return ({
    id: (0, tandem_common_1.generateUID)(),
    name: PCSourceTagNames.VARIANT,
    label: label,
    isDefault: isDefault,
    children: tandem_common_1.EMPTY_ARRAY,
    metadata: tandem_common_1.EMPTY_OBJECT
}); };
exports.createPCVariant = createPCVariant;
var createPCQuery = function (type, label, condition) {
    return ({
        id: (0, tandem_common_1.generateUID)(),
        name: PCSourceTagNames.QUERY,
        type: type,
        label: label,
        condition: condition,
        children: tandem_common_1.EMPTY_ARRAY,
        metadata: tandem_common_1.EMPTY_OBJECT
    });
};
exports.createPCQuery = createPCQuery;
var createPCVariantTrigger = function (source, targetVariantId) { return ({
    id: (0, tandem_common_1.generateUID)(),
    name: PCSourceTagNames.VARIANT_TRIGGER,
    targetVariantId: targetVariantId,
    source: source,
    children: tandem_common_1.EMPTY_ARRAY,
    metadata: tandem_common_1.EMPTY_OBJECT
}); };
exports.createPCVariantTrigger = createPCVariantTrigger;
var createPCVariable = function (label, type, value) { return ({
    id: (0, tandem_common_1.generateUID)(),
    name: PCSourceTagNames.VARIABLE,
    value: value,
    label: label,
    type: type,
    children: tandem_common_1.EMPTY_ARRAY,
    metadata: tandem_common_1.EMPTY_OBJECT
}); };
exports.createPCVariable = createPCVariable;
var createPCElement = function (is, style, attributes, children, label, metadata) {
    if (is === void 0) { is = "div"; }
    if (style === void 0) { style = tandem_common_1.EMPTY_OBJECT; }
    if (attributes === void 0) { attributes = tandem_common_1.EMPTY_OBJECT; }
    if (children === void 0) { children = tandem_common_1.EMPTY_ARRAY; }
    return ({
        id: (0, tandem_common_1.generateUID)(),
        label: label,
        is: is || "div",
        name: PCSourceTagNames.ELEMENT,
        attributes: attributes || tandem_common_1.EMPTY_OBJECT,
        style: style || tandem_common_1.EMPTY_OBJECT,
        children: children || tandem_common_1.EMPTY_ARRAY,
        metadata: metadata || tandem_common_1.EMPTY_OBJECT
    });
};
exports.createPCElement = createPCElement;
var createPCComponentInstance = function (is, style, attributes, children, metadata, label) {
    if (style === void 0) { style = tandem_common_1.EMPTY_OBJECT; }
    if (attributes === void 0) { attributes = tandem_common_1.EMPTY_OBJECT; }
    if (children === void 0) { children = tandem_common_1.EMPTY_ARRAY; }
    return ({
        id: (0, tandem_common_1.generateUID)(),
        is: is || "div",
        label: label,
        name: PCSourceTagNames.COMPONENT_INSTANCE,
        attributes: attributes || tandem_common_1.EMPTY_OBJECT,
        style: style || tandem_common_1.EMPTY_OBJECT,
        children: children || tandem_common_1.EMPTY_ARRAY,
        metadata: metadata || tandem_common_1.EMPTY_OBJECT,
        variant: tandem_common_1.EMPTY_OBJECT
    });
};
exports.createPCComponentInstance = createPCComponentInstance;
var createPCTextNode = function (value, label, style) {
    if (style === void 0) { style = tandem_common_1.EMPTY_OBJECT; }
    return ({
        id: (0, tandem_common_1.generateUID)(),
        name: PCSourceTagNames.TEXT,
        label: label || value,
        value: value,
        style: style || tandem_common_1.EMPTY_OBJECT,
        children: [],
        metadata: {}
    });
};
exports.createPCTextNode = createPCTextNode;
var createPCSlot = function (defaultChildren) { return ({
    id: (0, tandem_common_1.generateUID)(),
    children: defaultChildren || tandem_common_1.EMPTY_ARRAY,
    metadata: tandem_common_1.EMPTY_OBJECT,
    name: PCSourceTagNames.SLOT,
    label: "Slot"
}); };
exports.createPCSlot = createPCSlot;
var createPCPlug = function (slotId, children) { return ({
    slotId: slotId,
    id: (0, tandem_common_1.generateUID)(),
    children: children || tandem_common_1.EMPTY_ARRAY,
    metadata: tandem_common_1.EMPTY_OBJECT,
    name: PCSourceTagNames.PLUG
}); };
exports.createPCPlug = createPCPlug;
var createPCOverride = function (targetIdPath, propertyName, value, variantId) {
    var id = (0, tandem_common_1.generateUID)();
    var children;
    if (propertyName === PCOverridablePropertyName.CHILDREN) {
        return {
            id: id,
            variantId: variantId,
            propertyName: propertyName,
            targetIdPath: targetIdPath,
            name: PCSourceTagNames.OVERRIDE,
            children: value || [],
            metadata: {}
        };
    }
    return {
        id: id,
        variantId: variantId,
        propertyName: propertyName,
        targetIdPath: targetIdPath,
        value: value,
        name: PCSourceTagNames.OVERRIDE,
        children: []
    };
};
exports.createPCOverride = createPCOverride;
var createPCDependency = function (uri, module) { return ({
    uri: uri,
    content: module
}); };
exports.createPCDependency = createPCDependency;
/*------------------------------------------
 * TYPE UTILS
 *-----------------------------------------*/
var isValueOverride = function (node) {
    return node.propertyName !== PCOverridablePropertyName.CHILDREN;
};
exports.isValueOverride = isValueOverride;
var isVisibleNode = function (node) {
    return node.name === PCSourceTagNames.ELEMENT ||
        node.name === PCSourceTagNames.TEXT ||
        node.name === PCSourceTagNames.STYLE_MIXIN ||
        (0, exports.isPCComponentInstance)(node);
};
exports.isVisibleNode = isVisibleNode;
var isPCOverride = function (node) {
    return node.name === PCSourceTagNames.OVERRIDE;
};
exports.isPCOverride = isPCOverride;
var isComponent = function (node) {
    return node.name === PCSourceTagNames.COMPONENT;
};
exports.isComponent = isComponent;
var isSlot = function (node) {
    return node.name === PCSourceTagNames.SLOT;
};
exports.isSlot = isSlot;
var isPCPlug = function (node) {
    return node.name === PCSourceTagNames.PLUG;
};
exports.isPCPlug = isPCPlug;
var isPCComponentInstance = function (node) {
    return node.name === PCSourceTagNames.COMPONENT_INSTANCE;
};
exports.isPCComponentInstance = isPCComponentInstance;
var isPCComponentOrInstance = function (node) {
    return (0, exports.isPCComponentInstance)(node) || (0, exports.isComponent)(node);
};
exports.isPCComponentOrInstance = isPCComponentOrInstance;
var extendsComponent = function (element) {
    return (element.name == PCSourceTagNames.COMPONENT ||
        element.name === PCSourceTagNames.COMPONENT_INSTANCE) &&
        element.is.length > 6 &&
        /\d/.test(element.is);
};
exports.extendsComponent = extendsComponent;
var isTextLikePCNode = function (node) {
    return node.name === PCSourceTagNames.TEXT ||
        (node.name === PCSourceTagNames.STYLE_MIXIN &&
            node.targetType === PCSourceTagNames.TEXT);
};
exports.isTextLikePCNode = isTextLikePCNode;
var isElementLikePCNode = function (node) {
    return node.name === PCSourceTagNames.ELEMENT ||
        node.name === PCSourceTagNames.COMPONENT ||
        node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
        (node.name === PCSourceTagNames.STYLE_MIXIN &&
            node.targetType === PCSourceTagNames.ELEMENT);
};
exports.isElementLikePCNode = isElementLikePCNode;
/*------------------------------------------
 * GETTERS
 *-----------------------------------------*/
exports.getModuleComponents = (0, tandem_common_1.memoize)(function (root) {
    return root.children.reduce(function (components, contentNode) {
        return contentNode.name === PCSourceTagNames.COMPONENT
            ? __spreadArray(__spreadArray([], components, true), [contentNode], false) : components;
    }, []);
});
exports.getVisibleChildren = (0, tandem_common_1.memoize)(function (node) { return node.children.filter(exports.isVisibleNode); });
exports.getVisibleOrSlotChildren = (0, tandem_common_1.memoize)(function (node) {
    return node.children.filter(function (child) { return (0, exports.isVisibleNode)(child) || child.name === PCSourceTagNames.SLOT; });
});
exports.getOverrides = (0, tandem_common_1.memoize)(function (node) {
    return node.children.filter(exports.isPCOverride).sort(function (a, b) {
        return a.propertyName === PCOverridablePropertyName.CHILDREN
            ? 1
            : a.variantId
                ? -1
                : b.propertyName === PCOverridablePropertyName.CHILDREN
                    ? 0
                    : 1;
    });
});
exports.getPCVariants = (0, tandem_common_1.memoize)(function (component) {
    return component.children.filter(function (child) { return child.name === PCSourceTagNames.VARIANT; });
});
exports.getPCVariantOverrides = (0, tandem_common_1.memoize)(function (instance, variantId) {
    return instance.children.filter(function (override) {
        return (0, exports.isPCOverride)(override) &&
            override.propertyName ===
                PCOverridablePropertyName.VARIANT_IS_DEFAULT &&
            override.variantId == variantId;
    });
});
var getPCImportedChildrenSourceUris = function (_a, graph) {
    var nodeId = _a.id;
    var node = (0, exports.getPCNode)(nodeId, graph);
    var imported = {};
    (0, tandem_common_1.findNestedNode)(node, function (child) {
        var dep = (0, exports.getPCNodeDependency)(child.id, graph);
        imported[dep.uri] = 1;
    });
    return Object.keys(imported);
};
exports.getPCImportedChildrenSourceUris = getPCImportedChildrenSourceUris;
exports.getNativeComponentName = (0, tandem_common_1.memoize)(function (_a, graph) {
    var id = _a.id;
    var current = (0, exports.getPCNode)(id, graph);
    while ((0, exports.extendsComponent)(current)) {
        current = (0, exports.getPCNode)(current.is, graph);
    }
    return current.is;
});
// export const getComponentProperties = (memoize)
exports.getPCNodeDependency = (0, tandem_common_1.memoize)(function (nodeId, graph) {
    for (var uri in graph) {
        var dependency = graph[uri];
        if ((0, tandem_common_1.getNestedTreeNodeById)(nodeId, dependency.content)) {
            return dependency;
        }
    }
    return null;
});
exports.getGlobalVariables = (0, tandem_common_1.memoize)(function (graph) {
    return Object.values(graph).reduce(function (variables, dependency) {
        return __spreadArray(__spreadArray([], variables, true), dependency.content.children.filter(function (child) { return child.name === PCSourceTagNames.VARIABLE; }), true);
    }, tandem_common_1.EMPTY_ARRAY);
});
exports.getGlobalMediaQueries = (0, tandem_common_1.memoize)(function (graph) {
    return Object.values(graph).reduce(function (variables, dependency) {
        return __spreadArray(__spreadArray([], variables, true), dependency.content.children.filter(function (child) { return child.name === PCSourceTagNames.QUERY; }), true);
    }, tandem_common_1.EMPTY_ARRAY);
});
exports.filterVariablesByType = (0, tandem_common_1.memoize)(function (variables, type) {
    return variables.filter(function (variable) { return variable.type === type; });
});
exports.getInstanceSlots = (0, tandem_common_1.memoize)(function (node, graph) {
    if (!(0, exports.extendsComponent)(node)) {
        return [];
    }
    return (0, exports.getComponentSlots)((0, exports.getPCNode)(node.is, graph));
});
exports.getComponentSlots = (0, tandem_common_1.memoize)(function (component) {
    return (0, tandem_common_1.flattenTreeNode)(component).filter(exports.isSlot);
});
var getComponentVariantTriggers = function (component) {
    return (0, tandem_common_1.getTreeNodesByName)(PCSourceTagNames.VARIANT_TRIGGER, component);
};
exports.getComponentVariantTriggers = getComponentVariantTriggers;
var getVariantTriggers = function (variant, component) {
    return (0, exports.getComponentVariantTriggers)(component).filter(function (trigger) { return trigger.targetVariantId === variant.id; });
};
exports.getVariantTriggers = getVariantTriggers;
exports.getInstanceSlotContent = (0, tandem_common_1.memoize)(function (slotId, node) {
    return node.children.find(function (child) { return (0, exports.isPCPlug)(child) && child.slotId === slotId; });
});
var slotCount = 0;
exports.addPCNodePropertyBinding = (0, tandem_common_1.memoize)(function (node, bindProperty, sourceProperty) {
    // TODO - assert that property binding does not exist
    // TODO
});
exports.getInstanceShadow = (0, tandem_common_1.memoize)(function (instance, graph) {
    return (0, exports.getPCNode)(instance.is, graph);
});
exports.getSlotPlug = (0, tandem_common_1.memoize)(function (instance, slot) {
    return instance.children.find(function (child) {
        return child.name === PCSourceTagNames.PLUG && child.slotId === slot.id;
    });
});
exports.getInstanceExtends = (0, tandem_common_1.memoize)(function (instance, graph) {
    var current = instance;
    var components = [];
    while (1) {
        current = (0, exports.getPCNode)(current.is, graph);
        if (!current)
            break;
        components.push(current);
    }
    return components;
});
var getPCNode = function (nodeId, graph) {
    var dep = (0, exports.getPCNodeDependency)(nodeId, graph);
    if (!dep) {
        return null;
    }
    return (0, tandem_common_1.getNestedTreeNodeById)(nodeId, dep.content);
};
exports.getPCNode = getPCNode;
var filterPCNodes = function (graph, filter) {
    var found = [];
    for (var uri in graph) {
        var dep = graph[uri];
        found.push.apply(found, (0, tandem_common_1.filterNestedNodes)(dep.content, filter));
    }
    return found;
};
exports.filterPCNodes = filterPCNodes;
var isPCContentNode = function (node, graph) {
    var module = (0, exports.getPCNodeModule)(node.id, graph);
    return module.children.some(function (child) { return child.id === node.id; });
};
exports.isPCContentNode = isPCContentNode;
var getPCNodeModule = function (nodeId, graph) {
    var dep = (0, exports.getPCNodeDependency)(nodeId, graph);
    return dep && dep.content;
};
exports.getPCNodeModule = getPCNodeModule;
var getPCNodeContentNode = function (nodeId, module) {
    return module.children.find(function (contentNode) {
        return Boolean((0, tandem_common_1.getNestedTreeNodeById)(nodeId, contentNode));
    });
};
exports.getPCNodeContentNode = getPCNodeContentNode;
var updatePCNodeMetadata = function (metadata, node) { return (__assign(__assign({}, node), { metadata: __assign(__assign({}, node.metadata), metadata) })); };
exports.updatePCNodeMetadata = updatePCNodeMetadata;
var getComponentTemplate = function (component) {
    return component.children.find(exports.isVisibleNode);
};
exports.getComponentTemplate = getComponentTemplate;
var getComponentVariants = function (component) {
    return component.children.filter(function (child) { return child.name === PCSourceTagNames.VARIANT; });
};
exports.getComponentVariants = getComponentVariants;
var getDefaultVariantIds = function (component) {
    return (0, exports.getComponentVariants)(component)
        .filter(function (variant) { return variant.isDefault; })
        .map(function (variant) { return variant.id; });
};
exports.getDefaultVariantIds = getDefaultVariantIds;
exports.getNodeSourceComponent = (0, tandem_common_1.memoize)(function (node, graph) {
    return (0, exports.getPCNodeContentNode)(node.name, (0, exports.getPCNodeModule)(node.id, graph));
});
exports.getAllPCComponents = (0, tandem_common_1.memoize)(function (graph) {
    var components = [];
    for (var uri in graph) {
        var dep = graph[uri];
        components.push.apply(components, (0, tandem_common_1.getTreeNodesByName)(PCSourceTagNames.COMPONENT, dep.content));
    }
    return components;
});
exports.getAllStyleMixins = (0, tandem_common_1.memoize)(function (graph, targetType) {
    var mixins = [];
    for (var uri in graph) {
        var dep = graph[uri];
        mixins.push.apply(mixins, (0, tandem_common_1.getTreeNodesByName)(PCSourceTagNames.STYLE_MIXIN, dep.content).filter(function (mixin) {
            return !targetType || mixin.targetType === targetType;
        }));
    }
    return mixins;
});
var isVoidTagName = function (name) {
    return exports.VOID_TAG_NAMES.indexOf(name) !== -1;
};
exports.isVoidTagName = isVoidTagName;
exports.getComponentRefIds = (0, tandem_common_1.memoize)(function (node) {
    return (0, lodash_1.uniq)((0, tandem_common_1.reduceTree)(node, function (iss, node) {
        if (node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
            (node.name === PCSourceTagNames.COMPONENT && (0, exports.extendsComponent)(node))) {
            iss = __spreadArray(__spreadArray([], iss, true), [node.is], false);
        }
        if (node.styleMixins) {
            iss = __spreadArray(__spreadArray([], iss, true), Object.keys(node.styleMixins), true);
        }
        return iss;
    }, []));
});
exports.getSortedStyleMixinIds = (0, tandem_common_1.memoize)(function (node) {
    return Object.keys(node.styleMixins || tandem_common_1.EMPTY_OBJECT)
        .filter(function (nodeId) { return Boolean(node.styleMixins[nodeId]); })
        .sort(function (a, b) {
        return node.styleMixins[a].priority > node.styleMixins[b].priority
            ? -1
            : 1;
    });
});
exports.isVariantTriggered = (0, tandem_common_1.memoize)(function (instance, variant, graph) {
    var instanceModule = (0, exports.getPCNodeModule)(instance.id, graph);
    var instanceContentNode = (0, exports.getPCNodeContentNode)(instance.id, instanceModule);
    var instanceContentNodeBounds = instanceContentNode.metadata[PCVisibleNodeMetadataKey.BOUNDS];
    var instanceContentNodeSize = {
        width: instanceContentNodeBounds.right - instanceContentNodeBounds.left,
        height: instanceContentNodeBounds.bottom - instanceContentNodeBounds.top
    };
    var variantModule = (0, exports.getPCNodeModule)(variant.id, graph);
    var variantComponent = (0, exports.getPCNodeContentNode)(variant.id, variantModule);
    var variantTriggers = (0, exports.getVariantTriggers)(variant, variantComponent);
    return variantTriggers.some(function (trigger) {
        if (!trigger.source) {
            return false;
        }
        if (trigger.source.type !== PCVariantTriggerSourceType.QUERY) {
            return false;
        }
        var query = (0, exports.getPCNode)(trigger.source.queryId, graph);
        if (!query || !query.condition) {
            return false;
        }
        if (query.type === PCQueryType.MEDIA) {
            var _a = query.condition, minWidth = _a.minWidth, maxWidth = _a.maxWidth;
            if (minWidth != null && instanceContentNodeSize.width < minWidth) {
                return false;
            }
            if (maxWidth != null && instanceContentNodeSize.width > maxWidth) {
                return false;
            }
        }
        if (query.type === PCQueryType.VARIABLE) {
            var variable = (0, exports.getPCNode)(query.sourceVariableId, graph);
            if (!variable) {
                return false;
            }
            var _b = query.condition, equals = _b.equals, notEquals = _b.notEquals;
            if (equals != null && String(variable.value) !== String(equals)) {
                return false;
            }
            if (notEquals != null && String(variable.value) === String(notEquals)) {
                return false;
            }
        }
        return true;
    });
});
var variableQueryPassed = function (query, varMap) {
    var variable = varMap[query.sourceVariableId];
    if (!variable || !query.condition)
        return false;
    if (query.condition.equals) {
        return String(variable.value) === query.condition.equals;
    }
    if (query.condition.notEquals) {
        return String(variable.value) !== query.condition.notEquals;
    }
    return false;
};
exports.variableQueryPassed = variableQueryPassed;
exports.computePCNodeStyle = (0, tandem_common_1.memoize)(function (node, componentRefs, varMap) {
    if (!node.styleMixins) {
        return (0, exports.computeStyleWithVars)(node.style, varMap);
    }
    var style = {};
    var styleMixinIds = (0, exports.getSortedStyleMixinIds)(node);
    for (var i = 0, length_1 = styleMixinIds.length; i < length_1; i++) {
        var inheritComponent = componentRefs[styleMixinIds[i]];
        if (!inheritComponent) {
            continue;
        }
        Object.assign(style, (0, exports.computePCNodeStyle)(inheritComponent, componentRefs, varMap));
    }
    Object.assign(style, node.style);
    return (0, exports.computeStyleWithVars)(style, varMap);
});
exports.getComponentGraphRefs = (0, tandem_common_1.memoize)(function (node, graph) {
    var allRefs = [];
    var refIds = (0, exports.getComponentRefIds)(node);
    for (var i = 0, length_2 = refIds.length; i < length_2; i++) {
        var component = (0, exports.getPCNode)(refIds[i], graph);
        if (!component) {
            continue;
        }
        allRefs.push(component);
        allRefs.push.apply(allRefs, (0, exports.getComponentGraphRefs)(component, graph));
    }
    return (0, lodash_1.uniq)(allRefs);
});
var pcNodeEquals = function (a, b) {
    if (!pcNodeShallowEquals(a, b)) {
        return false;
    }
    if (a.children.length !== b.children.length) {
        return false;
    }
    for (var i = a.children.length; i--;) {
        if (!(0, exports.pcNodeEquals)(a.children[i], b.children[i])) {
            return false;
        }
    }
};
exports.pcNodeEquals = pcNodeEquals;
var pcNodeShallowEquals = function (a, b) {
    if (a.name !== b.name) {
        return false;
    }
    switch (a.name) {
        case PCSourceTagNames.ELEMENT: {
            return elementShallowEquals(a, b);
        }
        case PCSourceTagNames.COMPONENT_INSTANCE: {
            return componentInstanceShallowEquals(a, b);
        }
        case PCSourceTagNames.COMPONENT: {
            return componentShallowEquals(a, b);
        }
        case PCSourceTagNames.TEXT: {
            return textEquals(a, b);
        }
        case PCSourceTagNames.OVERRIDE: {
            return overrideShallowEquals(a, b);
        }
    }
};
var overrideShallowEquals = function (a, b) {
    return (a.propertyName === b.propertyName &&
        a.value ==
            b.value &&
        (0, lodash_1.isEqual)(a.targetIdPath, b.targetIdPath));
};
var textEquals = function (a, b) { return a.value === b.value; };
var elementShallowEquals = function (a, b) {
    return (0, lodash_1.isEqual)(a.attributes, b.attributes);
};
var componentInstanceShallowEquals = function (a, b) {
    return elementShallowEquals(a, b);
};
var componentShallowEquals = function (a, b) {
    return elementShallowEquals(a, b) && (0, lodash_1.isEqual)(a.controllers, b.controllers);
};
var nodeAryToRefMap = (0, tandem_common_1.memoize)(function (refs) {
    var componentRefMap = {};
    for (var i = 0, length_3 = refs.length; i < length_3; i++) {
        var ref = refs[i];
        componentRefMap[ref.id] = ref;
    }
    return componentRefMap;
});
exports.getComponentGraphRefMap = (0, tandem_common_1.memoize)(function (node, graph) {
    return nodeAryToRefMap((0, exports.getComponentGraphRefs)(node, graph));
});
exports.getVariableRefMap = (0, tandem_common_1.memoize)(function (node, graph) {
    return nodeAryToRefMap((0, exports.getVariableGraphRefs)(node, graph));
});
exports.getQueryRefMap = (0, tandem_common_1.memoize)(function (node, graph) {
    return nodeAryToRefMap((0, exports.getQueryGraphRefs)(node, graph));
});
exports.getAllVariableRefMap = (0, tandem_common_1.memoize)(function (graph) {
    return nodeAryToRefMap((0, exports.getGlobalVariables)(graph));
});
exports.getQueryGraphRefs = (0, tandem_common_1.memoize)(function (node, graph) {
    var triggers = (0, tandem_common_1.getTreeNodesByName)(PCSourceTagNames.VARIANT_TRIGGER, node);
    return (0, lodash_1.uniq)(triggers
        .filter(function (trigger) {
        return (trigger.source &&
            trigger.source.type === PCVariantTriggerSourceType.QUERY);
    })
        .map(function (trigger) {
        return (0, exports.getPCNode)(trigger.source.queryId, graph);
    }));
});
exports.getVariableGraphRefs = (0, tandem_common_1.memoize)(function (node, graph) {
    var allRefs = [];
    if (node.name === PCSourceTagNames.VARIANT_TRIGGER &&
        node.source &&
        node.source.type === PCVariantTriggerSourceType.QUERY) {
        var query = (0, exports.getPCNode)(node.source.queryId, graph);
        if (query.type === PCQueryType.VARIABLE) {
            var ref = (0, exports.getPCNode)(query.sourceVariableId, graph);
            if (ref) {
                allRefs.push(ref);
            }
        }
    }
    var refIds = (0, exports.isVisibleNode)(node) || node.name === PCSourceTagNames.COMPONENT
        ? (0, exports.getNodeStyleRefIds)(node.style)
        : (0, exports.isPCOverride)(node) &&
            node.propertyName === PCOverridablePropertyName.STYLE
            ? (0, exports.getNodeStyleRefIds)(node.value)
            : tandem_common_1.EMPTY_ARRAY;
    for (var i = 0, length_4 = refIds.length; i < length_4; i++) {
        var variable = (0, exports.getPCNode)(refIds[i], graph);
        if (!variable) {
            continue;
        }
        allRefs.push(variable);
    }
    if (node.styleMixins) {
        for (var styleMixinId in node.styleMixins) {
            var styleMixin = (0, exports.getPCNode)(styleMixinId, graph);
            // may have been deleted, or is new
            if (!styleMixin) {
                continue;
            }
            allRefs.push.apply(allRefs, (0, exports.getVariableGraphRefs)(styleMixin, graph));
        }
    }
    for (var i = 0, length_5 = node.children.length; i < length_5; i++) {
        var child = node.children[i];
        allRefs.push.apply(allRefs, (0, exports.getVariableGraphRefs)(child, graph));
    }
    return (0, lodash_1.uniq)(allRefs);
});
exports.getPCParentComponentInstances = (0, tandem_common_1.memoize)(function (node, root) {
    var parents = (0, tandem_common_1.filterTreeNodeParents)(node.id, root, exports.isPCComponentInstance);
    return parents;
});
var styleValueContainsCSSVar = function (value) {
    return value.search(/var\(.*?\)/) !== -1;
};
exports.styleValueContainsCSSVar = styleValueContainsCSSVar;
// not usable yet -- maybe with computed later on
var getCSSVars = function (value) {
    return (value.match(/var\(--[^\s]+?\)/g) || tandem_common_1.EMPTY_ARRAY).map(function (v) { return v.match(/var\(--(.*?)\)/)[1]; });
};
exports.getCSSVars = getCSSVars;
// not usable yet -- maybe with computed later on
var computeStyleWithVars = function (style, varMap) {
    var expandedStyle = {};
    for (var key in style) {
        expandedStyle[key] = (0, exports.computeStyleValue)(style[key], varMap);
    }
    return expandedStyle;
};
exports.computeStyleWithVars = computeStyleWithVars;
var computeStyleValue = function (value, varMap) {
    if (value && (0, exports.styleValueContainsCSSVar)(String(value))) {
        var cssVars = (0, exports.getCSSVars)(value);
        for (var _i = 0, cssVars_1 = cssVars; _i < cssVars_1.length; _i++) {
            var cssVar = cssVars_1[_i];
            var ref = varMap[cssVar];
            value = ref ? value.replace("var(--".concat(cssVar, ")"), ref.value) : value;
        }
    }
    return value;
};
exports.computeStyleValue = computeStyleValue;
exports.getNodeStyleRefIds = (0, tandem_common_1.memoize)(function (style) {
    var refIds = {};
    for (var key in style) {
        var value = style[key];
        // value c
        if (value && (0, exports.styleValueContainsCSSVar)(String(value))) {
            var cssVars = (0, exports.getCSSVars)(value);
            for (var _i = 0, cssVars_2 = cssVars; _i < cssVars_2.length; _i++) {
                var cssVar = cssVars_2[_i];
                refIds[cssVar] = 1;
            }
        }
    }
    return Object.keys(refIds);
});
exports.filterNestedOverrides = (0, tandem_common_1.memoize)(function (node) {
    return (0, tandem_common_1.filterNestedNodes)(node, exports.isPCOverride);
});
exports.getOverrideMap = (0, tandem_common_1.memoize)(function (node, contentNode, includeSelf) {
    var map = {
        default: {}
    };
    var overrides = (0, lodash_1.uniq)(__spreadArray(__spreadArray([], (0, exports.getOverrides)(node), true), (0, exports.getOverrides)(contentNode).filter(function (override) {
        return override.targetIdPath.indexOf(node.id) !== -1;
    }), true));
    for (var _i = 0, overrides_1 = overrides; _i < overrides_1.length; _i++) {
        var override = overrides_1[_i];
        if (override.variantId && !map[override.variantId]) {
            map[override.variantId] = {};
        }
        var targetOverrides = void 0;
        if (!(targetOverrides =
            map[override.variantId || exports.COMPUTED_OVERRIDE_DEFAULT_KEY])) {
            targetOverrides = map[override.variantId || exports.COMPUTED_OVERRIDE_DEFAULT_KEY] = {};
        }
        var targetIdPath = __spreadArray([], override.targetIdPath, true);
        var targetId = targetIdPath.pop() || node.id;
        if (includeSelf &&
            override.targetIdPath.length &&
            !(0, tandem_common_1.getNestedTreeNodeById)(targetId, node)) {
            targetIdPath.unshift(node.id);
        }
        for (var _a = 0, targetIdPath_1 = targetIdPath; _a < targetIdPath_1.length; _a++) {
            var nodeId = targetIdPath_1[_a];
            if (!targetOverrides[nodeId]) {
                targetOverrides[nodeId] = {
                    overrides: [],
                    children: {}
                };
            }
            targetOverrides = targetOverrides[nodeId].children;
        }
        if (!targetOverrides[targetId]) {
            targetOverrides[targetId] = {
                overrides: [],
                children: {}
            };
        }
        targetOverrides[targetId].overrides.push(override);
    }
    return map;
});
var mergeVariantOverrides = function (variantMap) {
    var map = {};
    for (var variantId in variantMap) {
        map = mergeVariantOverrides2(variantMap[variantId], map);
    }
    return map;
};
exports.mergeVariantOverrides = mergeVariantOverrides;
var mergeVariantOverrides2 = function (oldMap, existingMap) {
    var newMap = __assign({}, existingMap);
    for (var key in oldMap) {
        newMap[key] = {
            overrides: existingMap[key]
                ? __spreadArray(__spreadArray([], existingMap[key].overrides, true), oldMap[key].overrides, true) : oldMap[key].overrides,
            children: mergeVariantOverrides2(oldMap[key].children, (existingMap[key] || tandem_common_1.EMPTY_OBJECT).children || tandem_common_1.EMPTY_OBJECT)
        };
    }
    return newMap;
};
exports.flattenPCOverrideMap = (0, tandem_common_1.memoize)(function (map, idPath, flattened) {
    if (idPath === void 0) { idPath = []; }
    if (flattened === void 0) { flattened = {}; }
    for (var nodeId in map) {
        flattened[__spreadArray(__spreadArray([], idPath, true), [nodeId], false).join(" ")] = map[nodeId].overrides;
        (0, exports.flattenPCOverrideMap)(map[nodeId].children, __spreadArray(__spreadArray([], idPath, true), [nodeId], false), flattened);
    }
    return flattened;
});
/*------------------------------------------
 * SETTERS
 *-----------------------------------------*/
var replacePCNode = function (newNode, oldNode, graph) {
    var dependency = (0, exports.getPCNodeDependency)(oldNode.id, graph);
    return (0, graph_1.updateGraphDependency)({
        content: (0, tandem_common_1.replaceNestedNode)(newNode, oldNode.id, dependency.content)
    }, dependency.uri, graph);
};
exports.replacePCNode = replacePCNode;
//# sourceMappingURL=dsl.js.map

/***/ }),

/***/ "../paperclip/lib/edit.js":
/*!********************************!*\
  !*** ../paperclip/lib/edit.js ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.persistUpdateVariable = exports.persistAddQuery = exports.persistAddVariable = exports.persistChangeElementType = exports.persistChangeSyntheticTextNodeValue = exports.persistAppendPCClips = exports.persistStyleMixinComponentId = exports.persistStyleMixin = exports.persistReplacePCNode = exports.persistRemoveVariantOverride = exports.persistUpdateVariantTrigger = exports.persistAddVariantTrigger = exports.persistToggleInstanceVariant = exports.persistUpdateVariant = exports.persistRemoveVariant = exports.persistAddVariant = exports.persistInsertNode = exports.syncSyntheticDocuments = exports.persistRemoveComponentController = exports.persistAddComponentController = exports.getEntireFrameBounds = exports.persistWrapInSlot = exports.persistConvertInspectorNodeStyleToMixin = exports.persistConvertNodeToComponent = exports.persistChangeLabel = exports.upsertFrames = exports.updateSyntheticVisibleNodeBounds = exports.updateSyntheticVisibleNodePosition = exports.updateFrameBounds = exports.updateFrame = exports.updateFramePosition = exports.updateSyntheticVisibleNode = exports.replaceSyntheticVisibleNode = exports.removeInspectorNode = exports.updateSyntheticDocument = exports.getSyntheticDocumentById = exports.removeFrame = exports.replaceDependency = exports.updateDependencyGraph = exports.updatePCEditorState = exports.getPCNodeClip = exports.getFrameSyntheticNode = exports.getSyntheticVisibleNodeRelativeBounds = exports.getFrameByContentNodeId = exports.getSyntheticVisibleNodeFrame = exports.getSyntheticVisibleNodeComputedBounds = exports.getFramesByDependencyUri = exports.getSyntheticDocumentFrames = exports.getFramesContentNodeIdMap = exports.DEFAULT_FRAME_BOUNDS = void 0;
exports.evaluateEditedStateSync = exports.persistRemovePCNode = exports.persistRemoveInspectorNode = exports.canRemovePCNode = exports.canremoveInspectorNode = exports.persistInspectorNodeStyle = exports.persistAttribute = exports.persistCSSProperties = exports.persistCSSProperty = exports.persistRawCSSText = exports.persistSyntheticNodeMetadata = exports.persistMoveSyntheticVisibleNode = exports.persistSyntheticVisibleNodeBounds = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var synthetic_1 = __webpack_require__(/*! ./synthetic */ "../paperclip/lib/synthetic.js");
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var synthetic_layout_1 = __webpack_require__(/*! ./synthetic-layout */ "../paperclip/lib/synthetic-layout.js");
var ot_1 = __webpack_require__(/*! ./ot */ "../paperclip/lib/ot.js");
var evaluate_1 = __webpack_require__(/*! ./evaluate */ "../paperclip/lib/evaluate.js");
var inspector_1 = __webpack_require__(/*! ./inspector */ "../paperclip/lib/inspector.js");
var inspector_2 = __webpack_require__(/*! ./inspector */ "../paperclip/lib/inspector.js");
var style_1 = __webpack_require__(/*! ./style */ "../paperclip/lib/style.js");
/*------------------------------------------
 * CONSTANTS
 *-----------------------------------------*/
var NO_POINT = { left: 0, top: 0 };
var NO_BOUNDS = __assign(__assign({}, NO_POINT), { right: 0, bottom: 0 });
var MAX_CHECKSUM_COUNT = 40;
var FRAME_PADDING = 10;
var MIN_BOUND_SIZE = 1;
var PASTED_FRAME_OFFSET = { left: FRAME_PADDING, top: FRAME_PADDING };
exports.DEFAULT_FRAME_BOUNDS = {
    left: 0,
    top: 0,
    right: 400,
    bottom: 300
};
/*------------------------------------------
 * GETTERS
 *-----------------------------------------*/
exports.getFramesContentNodeIdMap = (0, tandem_common_1.memoize)(function (frames) {
    var map = {};
    for (var _i = 0, frames_1 = frames; _i < frames_1.length; _i++) {
        var frame = frames_1[_i];
        map[frame.syntheticContentNodeId] = frame;
    }
    return map;
});
exports.getSyntheticDocumentFrames = (0, tandem_common_1.memoize)(function (document, frames) {
    var frameMap = (0, exports.getFramesContentNodeIdMap)(frames);
    return document.children.map(function (contentNode) { return frameMap[contentNode.id]; });
});
exports.getFramesByDependencyUri = (0, tandem_common_1.memoize)(function (uri, frames, documents, graph) {
    var document = (0, synthetic_1.getSyntheticDocumentByDependencyUri)(uri, documents, graph);
    return document
        ? (0, exports.getSyntheticDocumentFrames)(document, frames)
        : tandem_common_1.EMPTY_ARRAY;
});
var getSyntheticVisibleNodeComputedBounds = function (node, frame, graph) {
    return (0, synthetic_1.isSyntheticContentNode)(node, graph)
        ? (0, tandem_common_1.moveBounds)(frame.bounds, NO_POINT)
        : (frame.computed &&
            frame.computed[node.id] &&
            frame.computed[node.id].bounds) ||
            NO_BOUNDS;
};
exports.getSyntheticVisibleNodeComputedBounds = getSyntheticVisibleNodeComputedBounds;
exports.getSyntheticVisibleNodeFrame = (0, tandem_common_1.memoize)(function (syntheticNode, frames) {
    return frames.find(function (frame) {
        return Boolean(frame.computed && frame.computed[syntheticNode.id]) ||
            frame.syntheticContentNodeId === syntheticNode.id;
    });
});
exports.getFrameByContentNodeId = (0, tandem_common_1.memoize)(function (nodeId, frames) {
    return frames.find(function (frame) { return frame.syntheticContentNodeId === nodeId; });
});
exports.getSyntheticVisibleNodeRelativeBounds = (0, tandem_common_1.memoize)(function (syntheticNode, frames, graph) {
    var frame = (0, exports.getSyntheticVisibleNodeFrame)(syntheticNode, frames);
    return frame
        ? (0, tandem_common_1.shiftBounds)((0, exports.getSyntheticVisibleNodeComputedBounds)(syntheticNode, frame, graph), frame.bounds)
        : NO_BOUNDS;
});
exports.getFrameSyntheticNode = (0, tandem_common_1.memoize)(function (frame, documents) {
    return (0, synthetic_1.getSyntheticNodeById)(frame.syntheticContentNodeId, documents);
});
var getPCNodeClip = function (node, rootNode, documents, frames, graph) {
    var sourceNode = (0, inspector_1.getInspectorSourceNode)(node, rootNode, graph);
    var syntheticNode = (0, inspector_1.getInspectorSyntheticNode)(node, documents);
    var contentNode = (0, inspector_1.getInspectorContentNode)(node, rootNode);
    var contentSyntheticNode = (0, inspector_1.getInspectorSyntheticNode)(contentNode, documents);
    var frame = contentSyntheticNode &&
        (0, exports.getSyntheticVisibleNodeFrame)(contentSyntheticNode, frames);
    return {
        uri: (0, dsl_1.getPCNodeDependency)(node.sourceNodeId, graph).uri,
        node: sourceNode,
        fixedBounds: (syntheticNode &&
            ((0, synthetic_1.isSyntheticContentNode)(syntheticNode, graph)
                ? frame.bounds
                : (0, exports.getSyntheticVisibleNodeRelativeBounds)(syntheticNode, frames, graph))) ||
            (frame && frame.bounds)
    };
};
exports.getPCNodeClip = getPCNodeClip;
/*------------------------------------------
 * SETTERS
 *-----------------------------------------*/
var updatePCEditorState = function (properties, state) {
    return (0, tandem_common_1.updateProperties)(properties, state);
};
exports.updatePCEditorState = updatePCEditorState;
var updateDependencyGraph = function (properties, state) {
    return (0, exports.updatePCEditorState)({
        graph: __assign(__assign({}, state.graph), properties)
    }, state);
};
exports.updateDependencyGraph = updateDependencyGraph;
var replaceDependencyGraphPCNode = function (newNode, oldNode, state) {
    var _a;
    if ((0, dsl_1.isPCContentNode)(oldNode, state.graph) &&
        newNode &&
        !newNode.metadata[dsl_1.PCVisibleNodeMetadataKey.BOUNDS]) {
        newNode = __assign(__assign({}, newNode), { metadata: __assign(__assign({}, newNode.metadata), (_a = {}, _a[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] = oldNode.metadata[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] ||
                exports.DEFAULT_FRAME_BOUNDS, _a)) });
    }
    return (0, exports.updateDependencyGraph)((0, dsl_1.replacePCNode)(newNode, oldNode, state.graph), state);
};
var replaceDependency = function (dep, state) {
    var _a;
    return (0, exports.updateDependencyGraph)((_a = {}, _a[dep.uri] = dep, _a), state);
};
exports.replaceDependency = replaceDependency;
var removeFrame = function (_a, state) {
    var syntheticContentNodeId = _a.syntheticContentNodeId;
    var frame = (0, exports.getFrameByContentNodeId)(syntheticContentNodeId, state.frames);
    if (frame == null) {
        throw new Error("Frame does not exist");
    }
    return (0, exports.updatePCEditorState)({
        frames: (0, tandem_common_1.arraySplice)(state.frames, state.frames.indexOf(frame), 1)
    }, state);
};
exports.removeFrame = removeFrame;
exports.getSyntheticDocumentById = (0, tandem_common_1.memoize)(function (id, documents) {
    return documents.find(function (document) { return document.id === id; });
});
var updateSyntheticDocument = function (properties, _a, state) {
    var id = _a.id;
    var document = (0, exports.getSyntheticDocumentById)(id, state.documents);
    if (!document) {
        throw new Error(" document does not exist");
    }
    var newDocument = __assign(__assign({}, document), properties);
    return (0, exports.upsertFrames)(__assign(__assign({}, state), { documents: (0, tandem_common_1.arraySplice)(state.documents, state.documents.indexOf(document), 1, newDocument) }));
};
exports.updateSyntheticDocument = updateSyntheticDocument;
var removeInspectorNode = function (node, state) {
    var document = (0, synthetic_1.getSyntheticVisibleNodeDocument)(node.id, state.documents);
    var syntheticNode = (0, inspector_1.getInspectorSyntheticNode)(node, state.documents);
    if (!syntheticNode) {
        return null;
    }
    if ((0, inspector_1.getInspectorContentNode)(node, state.sourceNodeInspector) === node) {
        state = (0, exports.removeFrame)((0, exports.getFrameByContentNodeId)(syntheticNode.id, state.frames), state);
    }
    return (0, exports.updateSyntheticDocument)(syntheticNode, document, state);
};
exports.removeInspectorNode = removeInspectorNode;
var replaceSyntheticVisibleNode = function (replacement, node, state) { return (0, exports.updateSyntheticVisibleNode)(node, state, function () { return replacement; }); };
exports.replaceSyntheticVisibleNode = replaceSyntheticVisibleNode;
var updateSyntheticVisibleNode = function (node, state, updater) {
    var document = (0, synthetic_1.getSyntheticVisibleNodeDocument)(node.id, state.documents);
    return (0, exports.updateSyntheticDocument)((0, tandem_common_1.updateNestedNode)(node, document, updater), document, state);
};
exports.updateSyntheticVisibleNode = updateSyntheticVisibleNode;
var updateFramePosition = function (position, _a, state) {
    var syntheticContentNodeId = _a.syntheticContentNodeId;
    var frame = (0, exports.getFrameByContentNodeId)(syntheticContentNodeId, state.frames);
    return (0, exports.updateFrameBounds)((0, tandem_common_1.moveBounds)(frame.bounds, position), frame, state);
};
exports.updateFramePosition = updateFramePosition;
var updateFrame = function (properties, _a, state) {
    var syntheticContentNodeId = _a.syntheticContentNodeId;
    var frame = (0, exports.getFrameByContentNodeId)(syntheticContentNodeId, state.frames);
    if (!frame) {
        throw new Error("frame does not exist");
    }
    return (0, exports.updatePCEditorState)({
        frames: (0, tandem_common_1.arraySplice)(state.frames, state.frames.indexOf(frame), 1, __assign(__assign({}, frame), properties))
    }, state);
};
exports.updateFrame = updateFrame;
var clampBounds = function (bounds) { return (__assign(__assign({}, bounds), { right: Math.max(bounds.right, bounds.left + MIN_BOUND_SIZE), bottom: Math.max(bounds.bottom, bounds.top + MIN_BOUND_SIZE) })); };
var updateFrameBounds = function (bounds, frame, state) {
    return (0, exports.updateFrame)({
        bounds: clampBounds(bounds)
    }, frame, state);
};
exports.updateFrameBounds = updateFrameBounds;
var updateSyntheticVisibleNodePosition = function (position, node, state) {
    if ((0, synthetic_1.isSyntheticContentNode)(node, state.graph)) {
        return (0, exports.updateFramePosition)(position, (0, exports.getSyntheticVisibleNodeFrame)(node, state.frames), state);
    }
    return (0, exports.updateSyntheticVisibleNode)(node, state, function (node) {
        var bounds = (0, exports.getSyntheticVisibleNodeRelativeBounds)(node, state.frames, state.graph);
        var newBounds = (0, synthetic_layout_1.convertFixedBoundsToRelative)((0, tandem_common_1.moveBounds)(bounds, position), node, (0, synthetic_1.getSyntheticVisibleNodeDocument)(node.id, state.documents), (0, exports.getSyntheticVisibleNodeFrame)(node, state.frames));
        return __assign(__assign({}, node), { style: __assign(__assign({}, node.style), { left: newBounds.left, top: newBounds.top }) });
    });
};
exports.updateSyntheticVisibleNodePosition = updateSyntheticVisibleNodePosition;
var updateSyntheticVisibleNodeBounds = function (bounds, node, state) {
    if ((0, synthetic_1.isSyntheticContentNode)(node, state.graph)) {
        return (0, exports.updateFrameBounds)(bounds, (0, exports.getSyntheticVisibleNodeFrame)(node, state.frames), state);
    }
    throw new Error("TODO");
};
exports.updateSyntheticVisibleNodeBounds = updateSyntheticVisibleNodeBounds;
var upsertFrames = function (state) {
    var frames = [];
    var framesByContentNodeId = (0, exports.getFramesContentNodeIdMap)(state.frames);
    for (var _i = 0, _a = state.documents; _i < _a.length; _i++) {
        var document_1 = _a[_i];
        for (var _b = 0, _c = document_1.children; _b < _c.length; _b++) {
            var contentNode = _c[_b];
            var sourceNode = (0, synthetic_1.getSyntheticSourceNode)(contentNode, state.graph);
            // synthetic document may be out of sync
            if (!sourceNode) {
                continue;
            }
            var existingFrame = framesByContentNodeId[contentNode.id];
            if (existingFrame) {
                frames.push((0, tandem_common_1.updateProperties)({
                    // todo add warning here that bounds do not exist when they should.
                    bounds: sourceNode.metadata[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] ||
                        exports.DEFAULT_FRAME_BOUNDS
                }, existingFrame));
            }
            else {
                frames.push({
                    syntheticContentNodeId: contentNode.id,
                    // todo add warning here that bounds do not exist when they should.
                    bounds: sourceNode.metadata[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] ||
                        exports.DEFAULT_FRAME_BOUNDS
                });
            }
        }
    }
    return (0, exports.updatePCEditorState)({ frames: frames }, state);
};
exports.upsertFrames = upsertFrames;
/*------------------------------------------
 * PERSISTING
 *-----------------------------------------*/
var persistChangeLabel = function (newLabel, sourceNode, state) {
    var newNode = __assign(__assign({}, sourceNode), { label: newLabel });
    return replaceDependencyGraphPCNode(newNode, newNode, state);
};
exports.persistChangeLabel = persistChangeLabel;
var persistConvertNodeToComponent = function (node, state) {
    var _a;
    var sourceNode = (0, inspector_1.getInspectorSourceNode)(node, state.sourceNodeInspector, state.graph);
    if ((0, dsl_1.isComponent)(sourceNode)) {
        return state;
    }
    var component = (0, dsl_1.createPCComponent)(sourceNode.label, sourceNode.is, sourceNode.style, sourceNode.attributes, sourceNode.name === dsl_1.PCSourceTagNames.TEXT
        ? [(0, tandem_common_1.cloneTreeNode)(sourceNode)]
        : (sourceNode.children || []).map(function (node) { return (0, tandem_common_1.cloneTreeNode)(node); }), null, sourceNode.styleMixins);
    if (node.name === inspector_1.InspectorTreeNodeName.CONTENT) {
        component = (0, dsl_1.updatePCNodeMetadata)(sourceNode.metadata, component);
        sourceNode = (0, dsl_1.updatePCNodeMetadata)((_a = {},
            _a[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] = undefined,
            _a), sourceNode);
        return replaceDependencyGraphPCNode(component, sourceNode, state);
    }
    var module = (0, dsl_1.getPCNodeModule)(sourceNode.id, state.graph);
    state = replaceDependencyGraphPCNode((0, tandem_common_1.appendChildNode)(addBoundsMetadata(node, component, state), module), module, state);
    var componentInstance = (0, dsl_1.createPCComponentInstance)(component.id, null, null, null, null, sourceNode.label);
    state = replaceDependencyGraphPCNode(componentInstance, sourceNode, state);
    return state;
};
exports.persistConvertNodeToComponent = persistConvertNodeToComponent;
var persistConvertInspectorNodeStyleToMixin = function (inspectorNode, variant, state, justTextStyles) {
    var _a;
    var sourceNode = (0, inspector_1.getInspectorSourceNode)(inspectorNode, state.sourceNodeInspector, state.graph);
    // const document = getSyntheticVisibleNodeDocument(node.id, state.documents);
    // const inspectorNode = getSyntheticInspectorNode(
    //   node,
    //   document,
    //   state.sourceNodeInspector,
    //   state.graph
    // );
    var computedStyle = (0, style_1.computeStyleInfo)(inspectorNode, state.sourceNodeInspector, variant, state.graph, {
        inheritedStyles: false,
        styleMixins: false,
        parentStyles: false,
        overrides: true
    });
    var style = justTextStyles
        ? (0, style_1.filterTextStyles)(computedStyle.style)
        : computedStyle.style;
    var styleMixin;
    if (sourceNode.name === dsl_1.PCSourceTagNames.TEXT || justTextStyles) {
        var newLabel = "".concat(sourceNode.label, " text style");
        styleMixin = (0, dsl_1.createPCTextStyleMixin)(style, newLabel, sourceNode.styleMixins, newLabel);
    }
    else if ((0, dsl_1.isElementLikePCNode)(sourceNode)) {
        var newLabel = "".concat(sourceNode.label, " style");
        styleMixin = (0, dsl_1.createPCElementStyleMixin)(style, sourceNode.styleMixins, newLabel);
    }
    var module = (0, dsl_1.getPCNodeModule)(sourceNode.id, state.graph);
    state = replaceDependencyGraphPCNode((0, tandem_common_1.appendChildNode)(addBoundsMetadata(inspectorNode, styleMixin, state), module), module, state);
    // remove styles from synthetic node since they've been moved to a mixin
    for (var key in style) {
        state = (0, exports.persistCSSProperty)(key, undefined, inspectorNode, variant, state);
    }
    state = (0, exports.persistStyleMixin)((_a = {},
        _a[styleMixin.id] = {
            // TODO - this needs to be part of the variant
            priority: Object.keys(sourceNode.styleMixins || tandem_common_1.EMPTY_OBJECT).length
        },
        _a), inspectorNode, variant, state);
    return state;
};
exports.persistConvertInspectorNodeStyleToMixin = persistConvertInspectorNodeStyleToMixin;
var persistWrapInSlot = function (node, state) {
    var sourceNode = (0, inspector_1.getInspectorSourceNode)(node, state.sourceNodeInspector, state.graph);
    if ((0, dsl_1.getPCNodeContentNode)(sourceNode.id, (0, dsl_1.getPCNodeModule)(sourceNode.id, state.graph)).name !== dsl_1.PCSourceTagNames.COMPONENT) {
        return state;
    }
    var newSource = (0, dsl_1.createPCSlot)([sourceNode]);
    state = replaceDependencyGraphPCNode(newSource, sourceNode, state);
    return state;
};
exports.persistWrapInSlot = persistWrapInSlot;
var moveBoundsToEmptySpace = function (bounds, frames) {
    var intersecting = (0, lodash_1.values)(frames).some(function (frame) {
        return (0, tandem_common_1.pointIntersectsBounds)(bounds, frame.bounds);
    });
    if (!intersecting)
        return bounds;
    var entireBounds = (0, exports.getEntireFrameBounds)(frames);
    return (0, tandem_common_1.moveBounds)(bounds, {
        left: entireBounds.right + FRAME_PADDING,
        top: entireBounds.top
    });
};
var getEntireFrameBounds = function (frames) {
    return tandem_common_1.mergeBounds.apply(void 0, (0, lodash_1.values)(frames).map(function (frame) { return frame.bounds; }));
};
exports.getEntireFrameBounds = getEntireFrameBounds;
var persistAddComponentController = function (uri, target, state) {
    var sourceNode = (0, synthetic_1.getSyntheticSourceNode)(target, state.graph);
    var sourceNodeDep = (0, dsl_1.getPCNodeDependency)(sourceNode.id, state.graph);
    var relativePath = path.relative(path.dirname((0, tandem_common_1.stripProtocol)(sourceNodeDep.uri)), (0, tandem_common_1.stripProtocol)(uri));
    if (relativePath.charAt(0) !== ".") {
        relativePath = "./" + relativePath;
    }
    sourceNode = __assign(__assign({}, sourceNode), { controllers: (0, lodash_1.uniq)(sourceNode.controllers
            ? __spreadArray(__spreadArray([], sourceNode.controllers, true), [relativePath], false) : [relativePath]) });
    return replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
};
exports.persistAddComponentController = persistAddComponentController;
var persistRemoveComponentController = function (relativePath, target, state) {
    var sourceNode = (0, synthetic_1.getSyntheticSourceNode)(target, state.graph);
    sourceNode = __assign(__assign({}, sourceNode), { controllers: (0, tandem_common_1.arraySplice)(sourceNode.controllers, sourceNode.controllers.indexOf(relativePath), 1) });
    return replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
};
exports.persistRemoveComponentController = persistRemoveComponentController;
/**
 * Synchronizes updated documents from the runtime engine. Updates are likely to be _behind_ in terms of
 * changes, so the editor state is the source of truth for the synthetic document to ensure that it doesn't
 * get clobbered with a previous version (which will cause bugs).
 */
var syncSyntheticDocuments = function (updatedDocuments, state) {
    return (0, exports.upsertFrames)(__assign(__assign({}, state), { documents: updatedDocuments }));
};
exports.syncSyntheticDocuments = syncSyntheticDocuments;
var persistInsertNode = function (newChild, _a, offset, state) {
    var relativeId = _a.id;
    var parentSource;
    if ((0, dsl_1.getPCNodeModule)(newChild.id, state.graph)) {
        // remove the child first
        state = replaceDependencyGraphPCNode(null, newChild, state);
    }
    var relative = (0, dsl_1.getPCNode)(relativeId, state.graph);
    if (relative.name === dsl_1.PCSourceTagNames.MODULE) {
        parentSource = (0, tandem_common_1.appendChildNode)(newChild, relative);
    }
    else {
        var index = void 0;
        if (offset === tandem_common_1.TreeMoveOffset.APPEND || offset === tandem_common_1.TreeMoveOffset.PREPEND) {
            parentSource = relative;
            index =
                offset === tandem_common_1.TreeMoveOffset.PREPEND ? 0 : parentSource.children.length;
        }
        else {
            var module_1 = (0, dsl_1.getPCNodeModule)(relative.id, state.graph);
            parentSource = (0, tandem_common_1.getParentTreeNode)(relative.id, module_1);
            index =
                parentSource.children.indexOf(relative) +
                    (offset === tandem_common_1.TreeMoveOffset.BEFORE ? 0 : 1);
        }
        parentSource = (0, tandem_common_1.insertChildNode)(newChild, index, parentSource);
    }
    return replaceDependencyGraphPCNode(parentSource, parentSource, state);
};
exports.persistInsertNode = persistInsertNode;
var persistAddVariant = function (label, contentNode, state) {
    var component = (0, synthetic_1.getSyntheticSourceNode)(contentNode, state.graph);
    state = replaceDependencyGraphPCNode((0, tandem_common_1.appendChildNode)((0, dsl_1.createPCVariant)(label, true), component), component, state);
    return state;
};
exports.persistAddVariant = persistAddVariant;
var persistRemoveVariant = function (variant, state) {
    var module = (0, dsl_1.getPCNodeModule)(variant.id, state.graph);
    state = replaceDependencyGraphPCNode((0, tandem_common_1.removeNestedTreeNode)(variant, module), module, state);
    return state;
};
exports.persistRemoveVariant = persistRemoveVariant;
var persistUpdateVariant = function (properties, variant, state) {
    state = replaceDependencyGraphPCNode(__assign(__assign({}, variant), properties), variant, state);
    return state;
};
exports.persistUpdateVariant = persistUpdateVariant;
var persistToggleInstanceVariant = function (instance, targetVariantId, variant, state) {
    var instanceVariantInfo = (0, inspector_1.getInstanceVariantInfo)(instance, state.sourceNodeInspector, state.graph);
    var variantInfo = instanceVariantInfo.find(function (info) { return info.variant.id === targetVariantId; });
    var node = maybeOverride2(dsl_1.PCOverridablePropertyName.VARIANT, null, variant, function (value, override) {
        var _a, _b;
        return override
            ? __assign(__assign({}, override.value), (_a = {}, _a[targetVariantId] = !override.value[targetVariantId], _a)) : (_b = {}, _b[targetVariantId] = !variantInfo.enabled, _b);
    }, function (node) {
        var _a;
        return (__assign(__assign({}, node), { variant: __assign(__assign({}, node.variant), (_a = {}, _a[targetVariantId] = !variantInfo.enabled, _a)) }));
    })(instance.instancePath, instance.sourceNodeId, state.sourceNodeInspector, state.graph);
    state = replaceDependencyGraphPCNode(node, node, state);
    return state;
};
exports.persistToggleInstanceVariant = persistToggleInstanceVariant;
var persistAddVariantTrigger = function (component, state) {
    var sourceNode = (0, inspector_1.getInspectorSourceNode)(component, state.sourceNodeInspector, state.graph);
    state = replaceDependencyGraphPCNode((0, tandem_common_1.appendChildNode)((0, dsl_1.createPCVariantTrigger)(null, null), sourceNode), sourceNode, state);
    return state;
};
exports.persistAddVariantTrigger = persistAddVariantTrigger;
var persistUpdateVariantTrigger = function (properties, trigger, state) {
    state = replaceDependencyGraphPCNode(__assign(__assign({}, trigger), properties), trigger, state);
    return state;
};
exports.persistUpdateVariantTrigger = persistUpdateVariantTrigger;
var persistRemoveVariantOverride = function (instance, targetVariantId, variant, state) {
    var override = (0, synthetic_1.getInheritedAndSelfOverrides)(instance, (0, synthetic_1.getSyntheticVisibleNodeDocument)(instance.id, state.documents), state.graph, variant && variant.id).find(function (override) { return (0, lodash_1.last)(override.targetIdPath) === targetVariantId; });
    return replaceDependencyGraphPCNode(null, override, state);
};
exports.persistRemoveVariantOverride = persistRemoveVariantOverride;
var persistReplacePCNode = function (newChild, oldChild, state) {
    return replaceDependencyGraphPCNode(newChild, oldChild, state);
};
exports.persistReplacePCNode = persistReplacePCNode;
var persistStyleMixin = function (styleMixins, node, variant, state) {
    var sourceNode = (0, inspector_1.getInspectorSourceNode)(node, state.sourceNodeInspector, state.graph);
    // const sourceNode = maybeOverride(
    //   PCOverridablePropertyName.INHERIT_STYLE,
    //   styleMixins,
    //   variant,
    //   (value, override) => {
    //     const prevStyle = (override && override.value) || EMPTY_OBJECT;
    //     return overrideKeyValue(node.style, prevStyle, {
    //       ...prevStyle,
    //       ...value
    //     });
    //   },
    //   (node: PCBaseVisibleNode<any>) => ({
    //     ...node,
    //     styleMixins: omitNull({
    //       ...(node.styleMixins || EMPTY_OBJECT),
    //       ...styleMixins
    //     })
    //   })
    // )(node, state.documents, state.graph);
    state = replaceDependencyGraphPCNode(__assign(__assign({}, sourceNode), { styleMixins: omitNull(__assign(__assign({}, (sourceNode.styleMixins || tandem_common_1.EMPTY_OBJECT)), styleMixins)) }), sourceNode, state);
    return state;
};
exports.persistStyleMixin = persistStyleMixin;
var persistStyleMixinComponentId = function (oldComponentId, newComponentId, node, variant, state) {
    var _a;
    // const sourceNode = maybeOverride(
    //   PCOverridablePropertyName.INHERIT_STYLE,
    //   null,
    //   variant,
    //   (value, override) => {
    //     const prevStyle = (override && override.value) || EMPTY_OBJECT;
    //     return overrideKeyValue(node.style, prevStyle, {
    //       ...prevStyle,
    //       [oldComponentId]: undefined,
    //       [newComponentId]: prevStyle[oldComponentId] || { priority: 0 }
    //     });
    //   },
    //   (node: PCBaseVisibleNode<any>) => ({
    //     ...node,
    // styleMixins: {
    //   ...(node.styleMixins || EMPTY_OBJECT),
    //   [oldComponentId]: undefined,
    //   [newComponentId]: node.styleMixins[oldComponentId]
    // }
    //   })
    // )(node, state.documents, state.graph);
    var sourceNode = (0, synthetic_1.getSyntheticSourceNode)(node, state.graph);
    state = replaceDependencyGraphPCNode(__assign(__assign({}, sourceNode), { styleMixins: __assign(__assign({}, (sourceNode.styleMixins || tandem_common_1.EMPTY_OBJECT)), (_a = {}, _a[oldComponentId] = undefined, _a[newComponentId] = sourceNode.styleMixins[oldComponentId], _a)) }), sourceNode, state);
    // state = replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
    return state;
};
exports.persistStyleMixinComponentId = persistStyleMixinComponentId;
var persistAppendPCClips = function (clips, target, offset, state) {
    var _a, _b;
    var targetSourceNode = (0, dsl_1.getPCNode)(target.sourceNodeId, state.graph);
    var targetDep = (0, dsl_1.getPCNodeDependency)(targetSourceNode.id, state.graph);
    var parentSourceNode = offset === tandem_common_1.TreeMoveOffset.BEFORE || offset === tandem_common_1.TreeMoveOffset.AFTER
        ? (0, tandem_common_1.getParentTreeNode)(targetSourceNode.id, targetDep.content)
        : targetSourceNode;
    var insertIndex = offset === tandem_common_1.TreeMoveOffset.BEFORE
        ? parentSourceNode.children.indexOf(targetSourceNode)
        : offset === tandem_common_1.TreeMoveOffset.AFTER
            ? parentSourceNode.children.indexOf(targetSourceNode) + 1
            : offset === tandem_common_1.TreeMoveOffset.APPEND
                ? parentSourceNode.children.length
                : 0;
    var targetNodeIsModule = parentSourceNode === targetDep.content;
    var content = targetDep.content;
    for (var _i = 0, clips_1 = clips; _i < clips_1.length; _i++) {
        var _c = clips_1[_i], node = _c.node, _d = _c.fixedBounds, fixedBounds = _d === void 0 ? exports.DEFAULT_FRAME_BOUNDS : _d;
        var sourceNode = node;
        // If there is NO source node, then possibly create a detached node and add to target component
        if (!sourceNode) {
            throw new Error("not implemented");
        }
        // is component
        if (sourceNode.name === dsl_1.PCSourceTagNames.COMPONENT) {
            var componentInstance = (0, dsl_1.createPCComponentInstance)(sourceNode.id, null, null, null, null, (0, dsl_1.getDerrivedPCLabel)(sourceNode, state.graph));
            if (targetNodeIsModule) {
                content = (0, tandem_common_1.insertChildNode)((0, dsl_1.updatePCNodeMetadata)((_a = {},
                    _a[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] = (0, tandem_common_1.shiftBounds)(fixedBounds, PASTED_FRAME_OFFSET),
                    _a), componentInstance), insertIndex, content);
            }
            else {
                content = (0, tandem_common_1.replaceNestedNode)((0, tandem_common_1.insertChildNode)(componentInstance, insertIndex, parentSourceNode), parentSourceNode.id, content);
            }
        }
        else {
            var clonedChild = (0, tandem_common_1.cloneTreeNode)(sourceNode);
            if (targetNodeIsModule &&
                !clonedChild.metadata[dsl_1.PCVisibleNodeMetadataKey.BOUNDS]) {
                clonedChild = (0, dsl_1.updatePCNodeMetadata)((_b = {},
                    _b[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] = (0, tandem_common_1.shiftBounds)(fixedBounds, PASTED_FRAME_OFFSET),
                    _b), clonedChild);
            }
            content = (0, tandem_common_1.replaceNestedNode)((0, tandem_common_1.insertChildNode)(clonedChild, insertIndex, parentSourceNode), parentSourceNode.id, content);
        }
    }
    state = replaceDependencyGraphPCNode(content, content, state);
    return state;
};
exports.persistAppendPCClips = persistAppendPCClips;
var persistChangeSyntheticTextNodeValue = function (value, node, state) {
    var updatedNode = maybeOverride2(dsl_1.PCOverridablePropertyName.TEXT, value, null, lodash_1.identity, function (sourceNode) { return (__assign(__assign({}, sourceNode), { value: value })); })(node.instancePath, node.sourceNodeId, state.sourceNodeInspector, state.graph);
    state = replaceDependencyGraphPCNode(updatedNode, updatedNode, state);
    return state;
};
exports.persistChangeSyntheticTextNodeValue = persistChangeSyntheticTextNodeValue;
var persistChangeElementType = function (typeOrComponentId, sourceNode, state) {
    var maybeComponent = (0, dsl_1.getPCNode)(typeOrComponentId, state.graph);
    if (maybeComponent || sourceNode.name === dsl_1.PCSourceTagNames.COMPONENT) {
        sourceNode = __assign(__assign({}, sourceNode), { variant: tandem_common_1.EMPTY_OBJECT, name: sourceNode.name === dsl_1.PCSourceTagNames.COMPONENT
                ? dsl_1.PCSourceTagNames.COMPONENT
                : dsl_1.PCSourceTagNames.COMPONENT_INSTANCE, is: typeOrComponentId, 
            // obliterate children, slots, and overrides associated with previous component since we don't have
            // an exact way to map slots and other stuff over to the new instance type. Might change later on though if we match labels.
            // We _could_ also display "orphaned" plugs that may be re-targeted to slots
            children: tandem_common_1.EMPTY_ARRAY });
    }
    else {
        sourceNode = __assign(__assign({}, sourceNode), { name: dsl_1.PCSourceTagNames.ELEMENT, is: typeOrComponentId, 
            // only copy children over if the prevuous node was an element
            children: sourceNode.name === dsl_1.PCSourceTagNames.ELEMENT &&
                !(0, dsl_1.isVoidTagName)(typeOrComponentId)
                ? sourceNode.children
                : tandem_common_1.EMPTY_ARRAY });
    }
    state = replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
    return state;
};
exports.persistChangeElementType = persistChangeElementType;
// TODO: style overrides, variant style overrides
var maybeOverride2 = function (propertyName, value, variant, mapOverride, updater) { return function (instancePath, nodeId, rootInspector, graph) {
    var sourceNode = (0, dsl_1.getPCNode)(nodeId, graph);
    var instancePathParts = instancePath
        ? instancePath.split(".")
        : tandem_common_1.EMPTY_ARRAY;
    // if content node does not exist, then target node must be id
    var topMostNodeId = instancePathParts.length
        ? instancePathParts[0]
        : nodeId;
    var topMostInspectorNode = (0, inspector_2.getInspectorNodeBySourceNodeId)(topMostNodeId, rootInspector);
    // call getInspectorNodeBySourceNodeId on parent if assoc inspector node doesn't exist. In this case, we're probably dealing with a source node
    // that does not have an assoc inspector node, so we defer to the owner (parent) instead.
    var contentNode = (0, inspector_2.getInspectorContentNodeContainingChild)(topMostInspectorNode, rootInspector) || topMostInspectorNode;
    var contentSourceNode = (0, inspector_1.getInspectorSourceNode)(contentNode, rootInspector, graph);
    var variantId = variant &&
        (0, tandem_common_1.getNestedTreeNodeById)(variant.id, contentSourceNode) &&
        variant.id;
    if (instancePathParts.length || variantId) {
        // if instancePath does NOT exist, then we're dealing with a variant
        var targetInstancePathParts = instancePathParts.length
            ? instancePathParts
            : tandem_common_1.EMPTY_ARRAY;
        var _a = targetInstancePathParts[0], topMostInstanceId = _a === void 0 ? contentSourceNode.id : _a, nestedInstanceIds = targetInstancePathParts.slice(1);
        var targetIdPathParts = __spreadArray([], nestedInstanceIds, true);
        // if source id is content id, then target is component root
        if (sourceNode.id !== contentSourceNode.id) {
            targetIdPathParts.push(sourceNode.id);
        }
        var targetIdPath_1 = targetIdPathParts.join(".");
        var topMostInstanceNode = (0, dsl_1.getPCNode)(topMostInstanceId, graph);
        var existingOverride = topMostInstanceNode.children.find(function (child) {
            return (child.name === dsl_1.PCSourceTagNames.OVERRIDE &&
                child.propertyName === propertyName &&
                child.targetIdPath.join(".") === targetIdPath_1 &&
                child.variantId == variantId);
        });
        value = mapOverride(value, existingOverride);
        if (existingOverride) {
            if (value == null) {
                return (0, tandem_common_1.removeNestedTreeNode)(existingOverride, topMostInstanceNode);
            }
            if (existingOverride.propertyName === dsl_1.PCOverridablePropertyName.CHILDREN) {
                existingOverride = __assign(__assign({}, existingOverride), { children: value });
            }
            else {
                existingOverride = __assign(__assign({}, existingOverride), { value: value });
            }
            return (0, tandem_common_1.replaceNestedNode)(existingOverride, existingOverride.id, topMostInstanceNode);
        }
        else {
            var override = (0, dsl_1.createPCOverride)(targetIdPathParts, propertyName, value, variantId);
            return (0, tandem_common_1.appendChildNode)(override, topMostInstanceNode);
        }
    }
    return updater(sourceNode, value);
}; };
var persistAddVariable = function (label, type, value, module, state) {
    return (0, exports.updateDependencyGraph)((0, dsl_1.replacePCNode)((0, tandem_common_1.appendChildNode)((0, dsl_1.createPCVariable)(label, type, value), module), module, state.graph), state);
};
exports.persistAddVariable = persistAddVariable;
var persistAddQuery = function (type, condition, label, module, state) {
    return (0, exports.updateDependencyGraph)((0, dsl_1.replacePCNode)((0, tandem_common_1.appendChildNode)((0, dsl_1.createPCQuery)(type, label, condition), module), module, state.graph), state);
};
exports.persistAddQuery = persistAddQuery;
var persistUpdateVariable = function (properties, _a, state) {
    var id = _a.id;
    var target = (0, dsl_1.getPCNode)(id, state.graph);
    return (0, exports.updateDependencyGraph)((0, dsl_1.replacePCNode)(__assign(__assign({}, target), properties), target, state.graph), state);
};
exports.persistUpdateVariable = persistUpdateVariable;
var maybeOverride = function (propertyName, value, variant, mapOverride, updater) { return function (node, documents, graph, targetSourceId) {
    if (targetSourceId === void 0) { targetSourceId = node.sourceNodeId; }
    var sourceNode = (0, dsl_1.getPCNode)(targetSourceId, graph);
    var contentNode = (0, synthetic_1.getSyntheticContentNode)(node, documents);
    if (!contentNode) {
        return updater(sourceNode, value);
    }
    var contentSourceNode = (0, synthetic_1.getSyntheticSourceNode)(contentNode, graph);
    var variantId = variant &&
        (0, tandem_common_1.getNestedTreeNodeById)(variant.id, contentSourceNode) &&
        variant.id;
    var defaultVariantIds = (0, dsl_1.isComponent)(contentSourceNode)
        ? (0, dsl_1.getPCVariants)(contentSourceNode)
            .filter(function (variant) { return variant.isDefault; })
            .map(function (variant) { return variant.id; })
        : [];
    var variantOverrides = (0, tandem_common_1.filterNestedNodes)(contentSourceNode, function (node) {
        return (0, dsl_1.isPCOverride)(node) &&
            defaultVariantIds.indexOf(node.variantId) !== -1;
    }).filter(function (override) {
        return (0, lodash_1.last)(override.targetIdPath) === sourceNode.id ||
            (override.targetIdPath.length === 0 &&
                sourceNode.id === contentSourceNode.id);
    });
    if ((0, synthetic_1.isSyntheticNodeImmutable)(node, (0, synthetic_1.getSyntheticVisibleNodeDocument)(node.id, documents), graph) ||
        variantId ||
        variantOverrides.length ||
        targetSourceId !== node.sourceNodeId) {
        var document_2 = (0, synthetic_1.getSyntheticVisibleNodeDocument)(node.id, documents);
        var nearestComponentInstances = (0, synthetic_1.getNearestComponentInstances)(node, document_2, graph);
        var mutableInstance = nearestComponentInstances.find(function (instance) { return !instance.immutable; });
        var mutableInstanceSourceNode = (0, synthetic_1.getSyntheticSourceNode)(mutableInstance, graph);
        // source node is an override, so go through the normal updater
        // if (getNestedTreeNodeById(sourceNode.id, furthestInstanceSourceNode)) {
        //   return updater(sourceNode, value);
        // }
        var overrideIdPath_1 = (0, lodash_1.uniq)(__spreadArray([], nearestComponentInstances
            .slice(0, nearestComponentInstances.indexOf(mutableInstance))
            .reverse()
            .map(function (node) { return node.sourceNodeId; }), true));
        if (sourceNode.id !== contentSourceNode.id &&
            !(overrideIdPath_1.length === 0 &&
                sourceNode.id === mutableInstanceSourceNode.id)) {
            overrideIdPath_1.push(sourceNode.id);
        }
        // ensure that we skip overrides
        overrideIdPath_1 = overrideIdPath_1.filter(function (id, index, path) {
            // is the target
            if (index === path.length - 1) {
                return true;
            }
            return !(0, tandem_common_1.getNestedTreeNodeById)(path[index + 1], (0, dsl_1.getPCNode)(id, graph));
        });
        var existingOverride = mutableInstanceSourceNode.children.find(function (child) {
            return (child.name === dsl_1.PCSourceTagNames.OVERRIDE &&
                child.targetIdPath.join("/") === overrideIdPath_1.join("/") &&
                child.propertyName === propertyName &&
                (!variantId || child.variantId == variantId));
        });
        value = mapOverride(value, existingOverride);
        if (existingOverride) {
            if (value == null) {
                return (0, tandem_common_1.removeNestedTreeNode)(existingOverride, mutableInstanceSourceNode);
            }
            if (existingOverride.propertyName === dsl_1.PCOverridablePropertyName.CHILDREN) {
                existingOverride = __assign(__assign({}, existingOverride), { children: value });
            }
            else {
                existingOverride = __assign(__assign({}, existingOverride), { value: value });
            }
            return (0, tandem_common_1.replaceNestedNode)(existingOverride, existingOverride.id, mutableInstanceSourceNode);
        }
        else if ((0, synthetic_1.isSyntheticNodeImmutable)(node, (0, synthetic_1.getSyntheticVisibleNodeDocument)(node.id, documents), graph) ||
            variantId ||
            node.id !== targetSourceId) {
            var override = (0, dsl_1.createPCOverride)(overrideIdPath_1, propertyName, value, variantId);
            return (0, tandem_common_1.appendChildNode)(override, mutableInstanceSourceNode);
        }
    }
    return updater(sourceNode, value);
}; };
var persistSyntheticVisibleNodeBounds = function (node, state) {
    var _a;
    var document = (0, synthetic_1.getSyntheticVisibleNodeDocument)(node.id, state.documents);
    if ((0, synthetic_1.isSyntheticContentNode)(node, state.graph)) {
        var frame = (0, exports.getSyntheticVisibleNodeFrame)(node, state.frames);
        var sourceNode = (0, synthetic_1.getSyntheticSourceNode)(node, state.graph);
        return replaceDependencyGraphPCNode((0, dsl_1.updatePCNodeMetadata)((_a = {},
            _a[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] = frame.bounds,
            _a), sourceNode), sourceNode, state);
    }
    else {
        throw new Error("TODO");
    }
};
exports.persistSyntheticVisibleNodeBounds = persistSyntheticVisibleNodeBounds;
// aias for inserting node
var persistMoveSyntheticVisibleNode = function (sourceNode, relative, offset, state) {
    return (0, exports.persistInsertNode)(sourceNode, relative, offset, state);
};
exports.persistMoveSyntheticVisibleNode = persistMoveSyntheticVisibleNode;
var persistSyntheticNodeMetadata = function (metadata, node, state) {
    var oldState = state;
    if ((0, synthetic_1.isSyntheticVisibleNode)(node)) {
        state = (0, exports.updateSyntheticVisibleNode)(node, state, function (node) { return (__assign(__assign({}, node), { metadata: __assign(__assign({}, node.metadata), metadata) })); });
    }
    var sourceNode = (0, synthetic_1.getSyntheticSourceNode)(node, state.graph);
    sourceNode = (0, dsl_1.updatePCNodeMetadata)(metadata, sourceNode);
    return replaceDependencyGraphPCNode(sourceNode, sourceNode, state);
};
exports.persistSyntheticNodeMetadata = persistSyntheticNodeMetadata;
var addBoundsMetadata = function (node, child, state) {
    var _a, _b;
    var syntheticNode = (0, inspector_1.getInspectorSyntheticNode)(node, state.documents);
    var contentNode = (0, inspector_1.getInspectorContentNode)(node, state.sourceNodeInspector);
    var syntheticContentNode = (0, inspector_1.getInspectorSyntheticNode)(contentNode, state.documents);
    if (!syntheticNode && !syntheticContentNode) {
        console.error("Synthetic node is invisible");
        // const sourceNode = getInspectorSourceNode(node, state.sourceNodeInspector, state.graph);
        return (0, dsl_1.updatePCNodeMetadata)((_a = {},
            _a[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] = exports.DEFAULT_FRAME_BOUNDS,
            _a), child);
    }
    var document = (0, synthetic_1.getSyntheticVisibleNodeDocument)(syntheticNode.id, state.documents);
    var frame = (0, exports.getSyntheticVisibleNodeFrame)(syntheticContentNode, state.frames);
    var syntheticNodeBounds = (0, exports.getSyntheticVisibleNodeRelativeBounds)(syntheticNode, state.frames, state.graph);
    var bestBounds = syntheticNodeBounds
        ? (0, tandem_common_1.moveBounds)(syntheticNodeBounds, frame.bounds)
        : exports.DEFAULT_FRAME_BOUNDS;
    var documentFrames = (0, exports.getSyntheticDocumentFrames)(document, state.frames);
    bestBounds = moveBoundsToEmptySpace(bestBounds, documentFrames);
    return (0, dsl_1.updatePCNodeMetadata)((_b = {},
        _b[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] = bestBounds,
        _b), child);
};
var persistRawCSSText = function (text, node, variant, state) {
    var newStyle = parseStyle(text || "");
    return (0, exports.persistInspectorNodeStyle)(newStyle, node, variant, state);
};
exports.persistRawCSSText = persistRawCSSText;
var omitNull = function (object) {
    return (0, lodash_1.pickBy)(object, function (value) {
        return value != null;
    });
};
var persistCSSProperty = function (name, value, inspectorNode, variant, state, allowUnset) {
    var _a;
    if (value === "") {
        value = undefined;
    }
    var computedStyle = (0, style_1.computeStyleInfo)(inspectorNode, state.sourceNodeInspector, variant, state.graph);
    if (value == null) {
        var overridingStyles = (0, style_1.computeStyleInfo)(inspectorNode, state.sourceNodeInspector, variant, state.graph, {
            self: false
        });
        if (overridingStyles.style[name] && allowUnset !== false) {
            value = "unset";
        }
    }
    var updatedNode = maybeOverride2(dsl_1.PCOverridablePropertyName.STYLE, (_a = {}, _a[name] = value, _a), variant, function (style, override) {
        var prevStyle = (override && override.value) || tandem_common_1.EMPTY_OBJECT;
        // note that we're omitting null since that kind of value may accidentally override parent props which
        // doesn't transpile to actually overrides styles.
        return overrideKeyValue(computedStyle, prevStyle, omitNull(__assign(__assign({}, prevStyle), style)));
    }, function (sourceNode) {
        var _a;
        return __assign(__assign({}, sourceNode), { style: omitNull(__assign(__assign({}, sourceNode.style), (_a = {}, _a[name] = value, _a))) });
    })(inspectorNode.instancePath, inspectorNode.sourceNodeId, state.sourceNodeInspector, state.graph);
    return replaceDependencyGraphPCNode(updatedNode, updatedNode, state);
};
exports.persistCSSProperty = persistCSSProperty;
var persistCSSProperties = function (properties, inspectorNode, variant, state) {
    state = (0, exports.persistInspectorNodeStyle)(properties, inspectorNode, variant, state, false);
    return state;
};
exports.persistCSSProperties = persistCSSProperties;
var persistAttribute = function (name, value, element, state) {
    var _a;
    if (value === "") {
        value = undefined;
    }
    var updatedNode = maybeOverride(dsl_1.PCOverridablePropertyName.ATTRIBUTES, (_a = {}, _a[name] = value, _a), null, function (attributes, override) {
        return overrideKeyValue(element.attributes, (override && override.value) || tandem_common_1.EMPTY_OBJECT, attributes);
    }, function (sourceNode) {
        var _a;
        return (__assign(__assign({}, sourceNode), { attributes: omitNull(__assign(__assign({}, sourceNode.attributes), (_a = {}, _a[name] = value, _a))) }));
    })(element, state.documents, state.graph);
    return replaceDependencyGraphPCNode(updatedNode, updatedNode, state);
};
exports.persistAttribute = persistAttribute;
var persistInspectorNodeStyle = function (newStyle, node, variant, state, clear) {
    if (clear === void 0) { clear = true; }
    var existingStyle = (0, style_1.computeStyleInfo)(node, state.sourceNodeInspector, variant, state.graph).style;
    for (var key in newStyle) {
        if (newStyle[key] === existingStyle[key]) {
            continue;
        }
        state = (0, exports.persistCSSProperty)(key, newStyle[key], node, variant, state);
    }
    if (clear) {
        for (var key in existingStyle) {
            if (newStyle[key]) {
                continue;
            }
            state = (0, exports.persistCSSProperty)(key, undefined, node, variant, state, false);
        }
    }
    return state;
};
exports.persistInspectorNodeStyle = persistInspectorNodeStyle;
var canremoveInspectorNode = function (node, state) {
    var sourceNode = (0, synthetic_1.getSyntheticSourceNode)(node, state.graph);
    if (!(0, dsl_1.isComponent)(sourceNode)) {
        return true;
    }
    var instancesOfComponent = (0, dsl_1.filterPCNodes)(state.graph, function (node) {
        return (((0, dsl_1.isPCComponentInstance)(node) || (0, dsl_1.isComponent)(node)) &&
            node.is === sourceNode.id);
    });
    return instancesOfComponent.length === 0;
};
exports.canremoveInspectorNode = canremoveInspectorNode;
var canRemovePCNode = function (sourceNode, state) {
    if (!(0, dsl_1.isComponent)(sourceNode)) {
        return true;
    }
    var instancesOfComponent = (0, dsl_1.filterPCNodes)(state.graph, function (node) {
        return (((0, dsl_1.isPCComponentInstance)(node) || (0, dsl_1.isComponent)(node)) &&
            node.is === sourceNode.id);
    });
    return instancesOfComponent.length === 0;
};
exports.canRemovePCNode = canRemovePCNode;
var persistRemoveInspectorNode = function (node, state) {
    // if the node is immutable, then it is part of an instance, so override the
    // style instead
    inspector_1.inspectorNodeInShadow;
    if ((0, inspector_1.inspectorNodeInShadow)(node, (0, inspector_1.getInspectorContentNode)(node, state.sourceNodeInspector))) {
        return (0, exports.persistInspectorNodeStyle)({ display: "none" }, node, null, state);
    }
    return (0, exports.persistRemovePCNode)((0, dsl_1.getPCNode)(node.sourceNodeId, state.graph), state);
};
exports.persistRemoveInspectorNode = persistRemoveInspectorNode;
var persistRemovePCNode = function (sourceNode, state) {
    return replaceDependencyGraphPCNode(null, sourceNode, state);
};
exports.persistRemovePCNode = persistRemovePCNode;
var parseStyle = function (source) {
    var style = {};
    source.split(";").forEach(function (decl) {
        var _a = decl.split(":"), key = _a[0], values = _a.slice(1);
        if (!key || !values.length)
            return;
        style[key.trim()] = values.join(":").trim();
    });
    return style;
};
var overrideKeyValue = function (main, oldOverrides, newOverrides) {
    var minOverrides = {};
    for (var key in newOverrides) {
        if (oldOverrides[key] != null || main[key] !== newOverrides[key]) {
            minOverrides[key] = newOverrides[key];
        }
    }
    return minOverrides;
};
// to be used only in tests
var evaluateEditedStateSync = function (state) {
    var documents = [];
    var newDocuments = (0, evaluate_1.evaluateDependencyGraph)(state.graph, null, tandem_common_1.EMPTY_OBJECT);
    for (var uri in newDocuments) {
        var newDocument = newDocuments[uri];
        var oldDocument = (0, synthetic_1.getSyntheticDocumentByDependencyUri)(uri, state.documents, state.graph);
        documents.push(oldDocument
            ? (0, ot_1.patchTreeNode)((0, ot_1.diffTreeNode)(oldDocument, newDocument), oldDocument)
            : newDocument);
    }
    state = (0, exports.upsertFrames)(__assign(__assign({}, state), { documents: documents }));
    return state;
};
exports.evaluateEditedStateSync = evaluateEditedStateSync;
//# sourceMappingURL=edit.js.map

/***/ }),

/***/ "../paperclip/lib/evaluate.js":
/*!************************************!*\
  !*** ../paperclip/lib/evaluate.js ***!
  \************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.evaluateDependencyGraph = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var vanilla_compiler_1 = __webpack_require__(/*! ./vanilla-compiler */ "../paperclip/lib/vanilla-compiler.js");
var synthetic_1 = __webpack_require__(/*! ./synthetic */ "../paperclip/lib/synthetic.js");
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

/***/ }),

/***/ "../paperclip/lib/graph.js":
/*!*********************************!*\
  !*** ../paperclip/lib/graph.js ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.addFileCacheItemToDependencyGraph = exports.isPaperclipUri = exports.getModifiedDependencies = exports.updateGraphDependency = exports.getDependents = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var migratePCModule = __webpack_require__(/*! paperclip-migrator */ "../paperclip-migrator/index.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
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

/***/ }),

/***/ "../paperclip/lib/index.js":
/*!*********************************!*\
  !*** ../paperclip/lib/index.js ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    Object.defineProperty(o, k2, { enumerable: true, get: function() { return m[k]; } });
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
Object.defineProperty(exports, "__esModule", ({ value: true }));
__exportStar(__webpack_require__(/*! ./synthetic */ "../paperclip/lib/synthetic.js"), exports);
__exportStar(__webpack_require__(/*! ./loader */ "../paperclip/lib/loader.js"), exports);
__exportStar(__webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js"), exports);
__exportStar(__webpack_require__(/*! ./evaluate */ "../paperclip/lib/evaluate.js"), exports);
__exportStar(__webpack_require__(/*! ./loader */ "../paperclip/lib/loader.js"), exports);
__exportStar(__webpack_require__(/*! ./constants */ "../paperclip/lib/constants.js"), exports);
__exportStar(__webpack_require__(/*! ./reducer */ "../paperclip/lib/reducer.js"), exports);
__exportStar(__webpack_require__(/*! ./saga */ "../paperclip/lib/saga.js"), exports);
__exportStar(__webpack_require__(/*! ./actions */ "../paperclip/lib/actions.js"), exports);
__exportStar(__webpack_require__(/*! ./dom-renderer */ "../paperclip/lib/dom-renderer.js"), exports);
__exportStar(__webpack_require__(/*! ./ot */ "../paperclip/lib/ot.js"), exports);
__exportStar(__webpack_require__(/*! ./graph */ "../paperclip/lib/graph.js"), exports);
__exportStar(__webpack_require__(/*! ./edit */ "../paperclip/lib/edit.js"), exports);
__exportStar(__webpack_require__(/*! ./config */ "../paperclip/lib/config.js"), exports);
__exportStar(__webpack_require__(/*! ./runtime */ "../paperclip/lib/runtime.js"), exports);
__exportStar(__webpack_require__(/*! ./vanilla-compiler */ "../paperclip/lib/vanilla-compiler.js"), exports);
__exportStar(__webpack_require__(/*! ./inspector */ "../paperclip/lib/inspector.js"), exports);
__exportStar(__webpack_require__(/*! ./style */ "../paperclip/lib/style.js"), exports);
__exportStar(__webpack_require__(/*! ./utils */ "../paperclip/lib/utils.js"), exports);
//# sourceMappingURL=index.js.map

/***/ }),

/***/ "../paperclip/lib/inspector.js":
/*!*************************************!*\
  !*** ../paperclip/lib/inspector.js ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.collapseInspectorNode = exports.getInspectorSyntheticNode = exports.getSyntheticInspectorNode = exports.getInspectorNodeParentShadow = exports.getInspectorInstanceShadowContentNode = exports.getInspectorInstanceShadow = exports.getInspectorContentNode = exports.getInspectorContentNodeContainingChild = exports.getInspectorNodeBySourceNodeId = exports.getSyntheticNodeInspectorNode = exports.getInspectorNodeOverrides = exports.getInheritedOverridesOverrides = exports.expandInspectorNodeById = exports.expandSyntheticInspectorNode = exports.expandInspectorNode = exports.inspectorNodeInInstanceOfComponent = exports.getInsertableInspectorNode = exports.getTopMostInspectorInstance = exports.getInspectorNodeOwnerInstance = exports.inspectorNodeInShadow = exports.getInstanceVariantInfo = exports.getInspectorSourceNode = exports.getInspectorNodeSyntheticDocument = exports.refreshInspectorTree = exports.isInspectorNode = exports.evaluateModuleInspector = exports.createRootInspectorNode = exports.InspectorTreeNodeName = void 0;
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var synthetic_1 = __webpack_require__(/*! ./synthetic */ "../paperclip/lib/synthetic.js");
var ot_1 = __webpack_require__(/*! ./ot */ "../paperclip/lib/ot.js");
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
// import { SyntheticNode, PCNode, PCModule, PCComponent, DependencyGraph, PCComponentInstanceElement, PCSourceTagNames, PCOverride, PCChildrenOverride } from "paperclip";
// /**
//  * Inspector tree node combines source & synthetic nodes together
//  * for designing & debugging. This exists primarily because source nodes aren't
//  * the best representation for debugging (instances for instances have shadows, bindings, and other dynamic properties), and
//  * Synthetic nodes aren't the best representations either since they can be verbose (repeated items for example), and they don't map well
//  * back to their original source (slotted nodes for example are rendered to their slots, conditional elements may or may not exist).
//  */
var InspectorTreeNodeName;
(function (InspectorTreeNodeName) {
    InspectorTreeNodeName["ROOT"] = "root";
    InspectorTreeNodeName["SOURCE_REP"] = "source-rep";
    InspectorTreeNodeName["SHADOW"] = "shadow";
    InspectorTreeNodeName["CONTENT"] = "content";
})(InspectorTreeNodeName = exports.InspectorTreeNodeName || (exports.InspectorTreeNodeName = {}));
var createRootInspectorNode = function () { return ({
    id: (0, tandem_common_1.generateUID)(),
    name: InspectorTreeNodeName.ROOT,
    children: tandem_common_1.EMPTY_ARRAY,
    expanded: true,
    instancePath: null,
    sourceNodeId: null
}); };
exports.createRootInspectorNode = createRootInspectorNode;
var createInspectorSourceRep = function (assocSourceNode, instancePath, expanded, children) {
    if (instancePath === void 0) { instancePath = null; }
    if (expanded === void 0) { expanded = false; }
    return ({
        id: (0, tandem_common_1.generateUID)(),
        name: InspectorTreeNodeName.SOURCE_REP,
        children: children || tandem_common_1.EMPTY_ARRAY,
        instancePath: instancePath,
        expanded: expanded,
        sourceNodeId: assocSourceNode.id
    });
};
var createInspectorShadow = function (assocSourceNode, instancePath, expanded, children) {
    if (expanded === void 0) { expanded = false; }
    return ({
        id: (0, tandem_common_1.generateUID)(),
        name: InspectorTreeNodeName.SHADOW,
        children: children || tandem_common_1.EMPTY_ARRAY,
        instancePath: instancePath,
        expanded: expanded,
        sourceNodeId: assocSourceNode.id
    });
};
var createInstanceContent = function (sourceSlotNodeId, instancePath, sourceNodeId, expanded, children) {
    if (sourceNodeId === void 0) { sourceNodeId = null; }
    if (expanded === void 0) { expanded = false; }
    return ({
        id: (0, tandem_common_1.generateUID)(),
        name: InspectorTreeNodeName.CONTENT,
        children: children || tandem_common_1.EMPTY_ARRAY,
        instancePath: instancePath,
        expanded: expanded,
        sourceSlotNodeId: sourceSlotNodeId,
        sourceNodeId: sourceNodeId
    });
};
var evaluateModuleInspector = function (module, graph, sourceMap) {
    if (sourceMap === void 0) { sourceMap = {}; }
    var inspectorChildren;
    sourceMap = JSON.parse(JSON.stringify(sourceMap));
    inspectorChildren = evaluateInspectorNodeChildren(module, "", graph, false, sourceMap);
    var inspectorNode = createInspectorSourceRep(module, "", true, inspectorChildren);
    addSourceMap(inspectorNode, sourceMap);
    return [inspectorNode, sourceMap];
};
exports.evaluateModuleInspector = evaluateModuleInspector;
// note that we're mutating state here because immutable performance
// here is _abysmal_.
var addSourceMap = function (inspectorNode, map) {
    if (!inspectorNode.sourceNodeId) {
        return map;
    }
    if (!map[inspectorNode.sourceNodeId]) {
        map[inspectorNode.sourceNodeId] = [];
    }
    map[inspectorNode.sourceNodeId].push(inspectorNode.id);
    return map;
};
var removeSourceMap = function (inspectorNode, map) {
    var walk = function (current) {
        if (!current.sourceNodeId) {
            return;
        }
        var index = map[current.sourceNodeId].indexOf(current.id);
        if (index !== -1) {
            map[current.sourceNodeId].splice(index, 1);
            if (map[current.sourceNodeId].length === 0) {
                map[current.sourceNodeId] = undefined;
            }
        }
        for (var _i = 0, _a = current.children; _i < _a.length; _i++) {
            var child = _a[_i];
            walk(child);
        }
    };
    walk(inspectorNode);
};
var evaluateInspectorNodeChildren = function (parent, instancePath, graph, fromInstanceShadow, sourceMap) {
    if (fromInstanceShadow === void 0) { fromInstanceShadow = false; }
    if ((0, dsl_1.extendsComponent)(parent)) {
        var component = (0, dsl_1.getPCNode)(parent.is, graph);
        var shadowInstancePath = !fromInstanceShadow &&
            (parent.name === dsl_1.PCSourceTagNames.COMPONENT_INSTANCE ||
                (0, tandem_common_1.getParentTreeNode)(parent.id, (0, dsl_1.getPCNodeModule)(parent.id, graph)).name ===
                    dsl_1.PCSourceTagNames.MODULE)
            ? addInstancePath(instancePath, parent)
            : instancePath;
        var shadowChildren = void 0;
        shadowChildren = evaluateInspectorNodeChildren(component, shadowInstancePath, graph, true, sourceMap);
        var shadow = createInspectorShadow(component, shadowInstancePath, false, shadowChildren);
        addSourceMap(shadow, sourceMap);
        var plugs = void 0;
        plugs = (0, dsl_1.getComponentSlots)(component).reduce(function (plugs, slot) {
            var plug = (0, dsl_1.getSlotPlug)(parent, slot);
            var inspectorChildren = [];
            inspectorChildren = plug
                ? evaluateInspectorNodeChildren(plug, instancePath, graph, false, sourceMap)
                : tandem_common_1.EMPTY_ARRAY;
            var inspector = createInstanceContent(slot.id, instancePath, (plug && plug.id) || null, false, inspectorChildren);
            addSourceMap(inspector, sourceMap);
            return __spreadArray(__spreadArray([], plugs, true), [inspector], false);
        }, tandem_common_1.EMPTY_ARRAY);
        var children = __spreadArray([shadow], plugs, true);
        return children;
    }
    else {
        var usablePCChildren = parent.children.filter(function (child) {
            return (0, dsl_1.isVisibleNode)(child) || (0, dsl_1.isSlot)(child) || (0, dsl_1.isComponent)(child);
        });
        return usablePCChildren.reduce(function (ret, child) {
            var inspectorChildren;
            inspectorChildren = evaluateInspectorNodeChildren(child, instancePath, graph, false, sourceMap);
            var inspector = createInspectorSourceRep(child, instancePath, false, inspectorChildren);
            addSourceMap(inspector, sourceMap);
            return __spreadArray(__spreadArray([], ret, true), [inspector], false);
        }, tandem_common_1.EMPTY_ARRAY);
    }
};
var isInspectorNode = function (node) {
    return (node.name === InspectorTreeNodeName.SOURCE_REP ||
        node.name === InspectorTreeNodeName.CONTENT ||
        node.name === InspectorTreeNodeName.SHADOW);
};
exports.isInspectorNode = isInspectorNode;
var refreshInspectorTree = function (root, newGraph, moduleUris, sourceMap, oldGraph) {
    var _a, _b;
    if (sourceMap === void 0) { sourceMap = tandem_common_1.EMPTY_OBJECT; }
    if (oldGraph === void 0) { oldGraph = tandem_common_1.EMPTY_OBJECT; }
    var newSourceMap = JSON.parse(JSON.stringify(sourceMap));
    var moduleChildren = [];
    // 1. remove source map info
    for (var _i = 0, _c = root.children; _i < _c.length; _i++) {
        var moduleInspectorNode = _c[_i];
        var dep = (0, dsl_1.getPCNodeDependency)(moduleInspectorNode.sourceNodeId, oldGraph);
        if (dep &&
            newSourceMap[dep.content.id] &&
            moduleUris.indexOf(dep.uri) !== -1) {
            moduleChildren.push(moduleInspectorNode);
        }
        else {
            removeSourceMap(moduleInspectorNode, newSourceMap);
        }
    }
    root = __assign(__assign({}, root), { children: moduleChildren });
    // 2. patch trees based on moduleUris
    for (var _d = 0, moduleUris_1 = moduleUris; _d < moduleUris_1.length; _d++) {
        var uri = moduleUris_1[_d];
        var oldDependency = oldGraph[uri];
        var newDep = newGraph[uri];
        if (!newDep) {
            continue;
        }
        var newModule = newDep.content;
        if (!oldDependency || !sourceMap[oldDependency.content.id]) {
            var moduleInspector = void 0;
            _a = (0, exports.evaluateModuleInspector)(newModule, newGraph, newSourceMap), moduleInspector = _a[0], newSourceMap = _a[1];
            root = (0, tandem_common_1.appendChildNode)(moduleInspector, root);
        }
        else {
            _b = patchInspectorTree2(root, newGraph, uri, newSourceMap, oldGraph), root = _b[0], newSourceMap = _b[1];
        }
    }
    return [root, newSourceMap];
};
exports.refreshInspectorTree = refreshInspectorTree;
var isUnreppedSourceNode = function (node) {
    return node.name === dsl_1.PCSourceTagNames.VARIABLE ||
        node.name === dsl_1.PCSourceTagNames.VARIANT_TRIGGER ||
        node.name === dsl_1.PCSourceTagNames.QUERY ||
        node.name === dsl_1.PCSourceTagNames.OVERRIDE ||
        node.name === dsl_1.PCSourceTagNames.VARIANT;
};
var patchInspectorTree2 = function (rootInspectorNode, newGraph, uri, sourceMap, oldGraph) {
    var newModule = newGraph[uri].content;
    var oldModule = oldGraph[uri].content;
    var tmpModule = oldModule;
    var now = Date.now();
    var ots = (0, ot_1.diffTreeNode)(tmpModule, newModule);
    var newSourceMap = sourceMap;
    for (var _i = 0, ots_1 = ots; _i < ots_1.length; _i++) {
        var ot = ots_1[_i];
        var targetNode = (0, tandem_common_1.getTreeNodeFromPath)(ot.nodePath, tmpModule);
        if (isUnreppedSourceNode(targetNode)) {
            continue;
        }
        tmpModule = (0, ot_1.patchTreeNode)([ot], tmpModule);
        var patchedTarget = (0, tandem_common_1.getTreeNodeFromPath)(ot.nodePath, tmpModule);
        var targetInspectorNodeInstanceIds = newSourceMap[patchedTarget.id];
        var _loop_1 = function (inspectorNodeId) {
            var targetInspectorNode = (0, tandem_common_1.getNestedTreeNodeById)(inspectorNodeId, rootInspectorNode);
            var newInspectorNode = targetInspectorNode;
            var shadow = targetInspectorNode.name === InspectorTreeNodeName.SHADOW
                ? targetInspectorNode
                : (0, exports.getInspectorNodeParentShadow)(targetInspectorNode, rootInspectorNode);
            switch (ot.type) {
                case ot_1.TreeNodeOperationalTransformType.INSERT_CHILD: {
                    var child = ot.child;
                    var pcChild_1 = child;
                    var reppedChildren = patchedTarget.children.filter(function (child) { return !isUnreppedSourceNode(child); });
                    var reppedIndex = reppedChildren.indexOf(pcChild_1);
                    // maybe an unrepped node, so ignore
                    if (reppedIndex === -1) {
                        break;
                    }
                    var inspectorChildren = void 0;
                    var newInspectorChild = void 0;
                    inspectorChildren = evaluateInspectorNodeChildren(pcChild_1, targetInspectorNode.instancePath, newGraph, Boolean(shadow), newSourceMap);
                    if (pcChild_1.name === dsl_1.PCSourceTagNames.PLUG) {
                        var existingInspectorPlug = targetInspectorNode.children.find(function (child) {
                            return child.name === InspectorTreeNodeName.CONTENT &&
                                child.sourceSlotNodeId === pcChild_1.slotId;
                        });
                        newInspectorNode = (0, tandem_common_1.removeNestedTreeNode)(existingInspectorPlug, newInspectorNode);
                        removeSourceMap(existingInspectorPlug, newSourceMap);
                        newInspectorChild = createInstanceContent(pcChild_1.slotId, targetInspectorNode.instancePath, pcChild_1.id, false, inspectorChildren);
                        // need to increment index by 1 to ensure that the child is
                        // inserted _after_ the shadow inspector node.
                        reppedIndex++;
                    }
                    else {
                        newInspectorChild = createInspectorSourceRep(pcChild_1, targetInspectorNode.instancePath, false, inspectorChildren);
                    }
                    newInspectorNode = (0, tandem_common_1.insertChildNode)(newInspectorChild, reppedIndex, newInspectorNode);
                    addSourceMap(newInspectorChild, newSourceMap);
                    // if the child is a slot, then add virtual content nodes ONLY for
                    // instances
                    if (pcChild_1.name === dsl_1.PCSourceTagNames.SLOT && shadow) {
                        // component is _always_ a contentNode
                        var component = (0, dsl_1.getPCNodeContentNode)(pcChild_1.id, (0, dsl_1.getPCNodeModule)(pcChild_1.id, newGraph));
                        var componentSlots = (0, tandem_common_1.getTreeNodesByName)(dsl_1.PCSourceTagNames.SLOT, component);
                        var insertIndex = componentSlots.findIndex(function (child) { return child.id === pcChild_1.id; });
                        var instanceInspectorNode = (0, tandem_common_1.getParentTreeNode)(shadow.id, rootInspectorNode);
                        var virtualPlug = createInstanceContent(pcChild_1.id, instanceInspectorNode.instancePath);
                        // insert index + 1 to bypass shadow
                        var newInspectorNode_1 = (0, tandem_common_1.insertChildNode)(virtualPlug, insertIndex + 1, instanceInspectorNode);
                        rootInspectorNode = (0, tandem_common_1.replaceNestedNode)(newInspectorNode_1, newInspectorNode_1.id, rootInspectorNode);
                    }
                    break;
                }
                case ot_1.TreeNodeOperationalTransformType.REMOVE_CHILD: {
                    var index = ot.index;
                    var pcChild_2 = targetNode.children[index];
                    var inspectorChild = newInspectorNode.children.find(function (child) {
                        return child.sourceNodeId === pcChild_2.id;
                    });
                    if (!inspectorChild) {
                        break;
                    }
                    var inspectorChildIndex = newInspectorNode.children.indexOf(inspectorChild);
                    newInspectorNode = (0, tandem_common_1.removeNestedTreeNode)(inspectorChild, newInspectorNode);
                    removeSourceMap(inspectorChild, newSourceMap);
                    if (inspectorChild.name === InspectorTreeNodeName.CONTENT) {
                        var placeholderInspectorNode = createInstanceContent(inspectorChild.sourceSlotNodeId, newInspectorNode.instancePath);
                        newInspectorNode = (0, tandem_common_1.insertChildNode)(placeholderInspectorNode, inspectorChildIndex, newInspectorNode);
                        addSourceMap(placeholderInspectorNode, newSourceMap);
                    }
                    break;
                }
                case ot_1.TreeNodeOperationalTransformType.MOVE_CHILD: {
                    var oldIndex = ot.oldIndex, newIndex = ot.newIndex;
                    var pcChild_3 = targetNode.children[oldIndex];
                    var beforeChild_1 = targetNode.children[newIndex];
                    var inspectorChild = newInspectorNode.children.find(function (child) {
                        return child.sourceNodeId === pcChild_3.id;
                    });
                    var beforeInspectorChildIndex = beforeChild_1
                        ? newInspectorNode.children.findIndex(function (child) {
                            return child.sourceNodeId === beforeChild_1.id;
                        })
                        : newInspectorNode.children.length;
                    if (!inspectorChild || beforeInspectorChildIndex === -1) {
                        break;
                    }
                    newInspectorNode = (0, tandem_common_1.removeNestedTreeNode)(inspectorChild, newInspectorNode);
                    newInspectorNode = (0, tandem_common_1.insertChildNode)(inspectorChild, beforeInspectorChildIndex, newInspectorNode);
                    break;
                }
                case ot_1.TreeNodeOperationalTransformType.SET_PROPERTY: {
                    var name_1 = ot.name, value = ot.value;
                    // instance type change, so we need to replace all current children with appropriate shadow & plugs
                    if ((patchedTarget.name === dsl_1.PCSourceTagNames.COMPONENT_INSTANCE &&
                        name_1 === "is") ||
                        (name_1 === "name" && value === "component-instance")) {
                        for (var _b = 0, _c = newInspectorNode.children; _b < _c.length; _b++) {
                            var child = _c[_b];
                            newInspectorNode = (0, tandem_common_1.removeNestedTreeNode)(child, newInspectorNode);
                            removeSourceMap(child, newSourceMap);
                        }
                        var newChildren = evaluateInspectorNodeChildren(patchedTarget, targetInspectorNode.instancePath, newGraph, Boolean(shadow), newSourceMap);
                        newInspectorNode = __assign(__assign({}, newInspectorNode), { children: newChildren });
                    }
                    break;
                }
            }
            if (targetInspectorNode !== newInspectorNode) {
                rootInspectorNode = (0, tandem_common_1.replaceNestedNode)(newInspectorNode, targetInspectorNode.id, rootInspectorNode);
            }
        };
        for (var _a = 0, targetInspectorNodeInstanceIds_1 = targetInspectorNodeInstanceIds; _a < targetInspectorNodeInstanceIds_1.length; _a++) {
            var inspectorNodeId = targetInspectorNodeInstanceIds_1[_a];
            _loop_1(inspectorNodeId);
        }
    }
    return [rootInspectorNode, newSourceMap];
};
var getInspectorNodeSyntheticDocument = function (node, ancestor, graph, documents) {
    var sourceNode = (0, exports.getInspectorSourceNode)(node, ancestor, graph);
    if (!sourceNode) {
        return null;
    }
    var dependency = (0, dsl_1.getPCNodeDependency)(sourceNode.id, graph);
    return (0, synthetic_1.getSyntheticDocumentByDependencyUri)(dependency.uri, documents, graph);
};
exports.getInspectorNodeSyntheticDocument = getInspectorNodeSyntheticDocument;
var getInspectorSourceNode = function (node, ancestor, graph) {
    if (node.name === InspectorTreeNodeName.CONTENT) {
        var nodeSource = (0, dsl_1.getPCNode)(node.sourceSlotNodeId, graph);
        var parent_1 = (0, tandem_common_1.getParentTreeNode)(node.id, ancestor);
        return (0, dsl_1.getSlotPlug)((0, dsl_1.getPCNode)(parent_1.sourceNodeId, graph), nodeSource);
    }
    else {
        return (0, dsl_1.getPCNode)(node.sourceNodeId, graph);
    }
};
exports.getInspectorSourceNode = getInspectorSourceNode;
exports.getInstanceVariantInfo = (0, tandem_common_1.memoize)(function (node, root, graph, selectedVariantId) {
    var instance = (0, exports.getInspectorSourceNode)(node, root, graph);
    var component = (0, dsl_1.getPCNode)(instance.is, graph);
    var variants = (0, dsl_1.getPCVariants)(component);
    var parentNodes = __spreadArray([
        node
    ], (0, tandem_common_1.getTreeNodeAncestors)(node.id, root), true);
    var enabled = {};
    var _loop_2 = function (parentNode) {
        var parentSourceNode = (0, dsl_1.getPCNode)(parentNode.sourceNodeId, graph);
        if (!parentSourceNode) {
            return "continue";
        }
        var variant = parentSourceNode.name === dsl_1.PCSourceTagNames.COMPONENT ||
            parentSourceNode.name === dsl_1.PCSourceTagNames.COMPONENT_INSTANCE
            ? parentSourceNode.variant
            : tandem_common_1.EMPTY_OBJECT;
        var variantOverride = parentSourceNode.children.find(function (child) {
            return child.name === dsl_1.PCSourceTagNames.OVERRIDE &&
                child.propertyName === dsl_1.PCOverridablePropertyName.VARIANT &&
                ((0, lodash_1.last)(child.targetIdPath) === instance.id ||
                    (child.targetIdPath.length === 0 &&
                        parentSourceNode.id === instance.id)) &&
                child.variantId == selectedVariantId;
        });
        Object.assign(enabled, variant, variantOverride && variantOverride.value);
    };
    for (var _i = 0, parentNodes_1 = parentNodes; _i < parentNodes_1.length; _i++) {
        var parentNode = parentNodes_1[_i];
        _loop_2(parentNode);
    }
    return variants.map(function (variant) { return ({
        variant: variant,
        component: component,
        enabled: enabled[variant.id]
    }); });
});
var inspectorNodeInShadow = function (node, contentNode) {
    return Boolean((0, tandem_common_1.findTreeNodeParent)(node.id, contentNode, function (parent) { return parent.name === InspectorTreeNodeName.SHADOW; }));
};
exports.inspectorNodeInShadow = inspectorNodeInShadow;
var getInspectorNodeOwnerInstance = function (node, root) {
    return (0, tandem_common_1.findTreeNodeParent)(node.id, root, function (parent) {
        return !(0, exports.inspectorNodeInShadow)(parent, root) &&
            parent.name === InspectorTreeNodeName.SOURCE_REP;
    });
};
exports.getInspectorNodeOwnerInstance = getInspectorNodeOwnerInstance;
var getInspectorNodeOwnerSlot = function (node, root, graph) {
    return (0, tandem_common_1.findTreeNodeParent)(node.id, root, function (parent) {
        return (0, dsl_1.getPCNode)(parent.sourceNodeId, graph) &&
            (0, dsl_1.getPCNode)(parent.sourceNodeId, graph).name === dsl_1.PCSourceTagNames.SLOT;
    });
};
var getTopMostInspectorInstance = function (current, root) {
    while ((0, exports.inspectorNodeInShadow)(current, root) ||
        current.name === InspectorTreeNodeName.SHADOW) {
        current = (0, tandem_common_1.getParentTreeNode)(current.id, root);
    }
    return current;
};
exports.getTopMostInspectorInstance = getTopMostInspectorInstance;
var getInsertableInspectorNode = function (child, root, graph) {
    if ((0, exports.inspectorNodeInShadow)(child, root)) {
        var slot = getInspectorNodeOwnerSlot(child, root, graph);
        return slot;
    }
    else {
        return child;
    }
};
exports.getInsertableInspectorNode = getInsertableInspectorNode;
/**
 * Used primarily to check for circular references
 */
var inspectorNodeInInstanceOfComponent = function (componentId, inspectorNode, root) {
    return __spreadArray([inspectorNode], (0, tandem_common_1.getTreeNodeAncestors)(inspectorNode.id, root), true).some(function (parent) {
        return (parent.name === InspectorTreeNodeName.SOURCE_REP &&
            parent.sourceNodeId === componentId);
    });
};
exports.inspectorNodeInInstanceOfComponent = inspectorNodeInInstanceOfComponent;
var expandInspectorNode = function (node, root) {
    if (node.expanded) {
        return root;
    }
    return (0, tandem_common_1.updateNestedNode)(node, root, function (node) {
        return __assign(__assign({}, node), { expanded: true });
    });
};
exports.expandInspectorNode = expandInspectorNode;
var expandSyntheticInspectorNode = function (node, document, rootInspectorNode, graph) {
    var instancePath = (0, synthetic_1.getSyntheticInstancePath)(node, document, graph).join(".");
    var sourceNodeId = node.sourceNodeId;
    var relatedInspectorNode = (0, tandem_common_1.flattenTreeNode)(rootInspectorNode).find(function (child) {
        return child.instancePath === instancePath && child.sourceNodeId === sourceNodeId;
    });
    if (!relatedInspectorNode) {
        console.error("Inspector node ".concat(instancePath, ".").concat(sourceNodeId, " not found"));
        return rootInspectorNode;
    }
    rootInspectorNode = (0, exports.expandInspectorNodeById)(relatedInspectorNode.id, rootInspectorNode);
    return rootInspectorNode;
};
exports.expandSyntheticInspectorNode = expandSyntheticInspectorNode;
var expandInspectorNodeById = function (id, rootInspectorNode) {
    return (0, tandem_common_1.updateNestedNodeTrail)((0, tandem_common_1.getTreeNodePath)(id, rootInspectorNode), rootInspectorNode, function (node) {
        return __assign(__assign({}, node), { expanded: true });
    });
};
exports.expandInspectorNodeById = expandInspectorNodeById;
var getInheritedOverridesOverrides = function (inspectorNode, rootInspectorNode, graph) {
    if (!inspectorNode.sourceNodeId) {
        return null;
    }
    var sourceNode = (0, dsl_1.getPCNode)(inspectorNode.sourceNodeId, graph);
    var overrides = (0, dsl_1.getOverrides)(sourceNode);
    var parent = (0, tandem_common_1.getParentTreeNode)(inspectorNode.id, rootInspectorNode);
    if (parent && parent.sourceNodeId) {
        overrides = __spreadArray(__spreadArray([], overrides, true), (0, exports.getInheritedOverridesOverrides)(parent, rootInspectorNode, graph), true);
    }
    return overrides;
};
exports.getInheritedOverridesOverrides = getInheritedOverridesOverrides;
// TODO - move to paperclip
exports.getInspectorNodeOverrides = (0, tandem_common_1.memoize)(function (inspectorNode, rootInspectorNode, variant, graph) {
    var overrides = [];
    if (!inspectorNode.sourceNodeId) {
        return overrides;
    }
    var sourceNode = (0, dsl_1.getPCNode)(inspectorNode.sourceNodeId, graph);
    var inheritedOverrides = (0, exports.getInheritedOverridesOverrides)(inspectorNode, rootInspectorNode, graph);
    for (var _i = 0, inheritedOverrides_1 = inheritedOverrides; _i < inheritedOverrides_1.length; _i++) {
        var override = inheritedOverrides_1[_i];
        var overrideModule = (0, dsl_1.getPCNodeModule)(override.id, graph);
        var matchesVariant = !override.variantId || override.variantId == (variant && variant.id);
        var overrideIsTarget = (0, lodash_1.last)(override.targetIdPath) === inspectorNode.sourceNodeId;
        var overrideTargetIsParent = override.targetIdPath.length === 0 &&
            (0, tandem_common_1.getParentTreeNode)(override.id, overrideModule).id === sourceNode.id;
        if (matchesVariant && (overrideIsTarget || overrideTargetIsParent)) {
            overrides.push(override);
        }
    }
    return overrides;
});
var getSyntheticNodeInspectorNode = function (node, state) {
    var sourceNode = (0, synthetic_1.getSyntheticSourceNode)(node, state.graph);
    return (0, tandem_common_1.flattenTreeNode)(state.sourceNodeInspector).find(function (child) { return child.sourceNodeId === sourceNode.id; });
};
exports.getSyntheticNodeInspectorNode = getSyntheticNodeInspectorNode;
var getInspectorNodeBySourceNodeId = function (sourceNodeId, root) {
    return (0, tandem_common_1.flattenTreeNode)(root).find(function (child) { return !child.instancePath && child.sourceNodeId === sourceNodeId; });
};
exports.getInspectorNodeBySourceNodeId = getInspectorNodeBySourceNodeId;
exports.getInspectorContentNodeContainingChild = (0, tandem_common_1.memoize)(function (child, root) {
    for (var i = 0, n1 = root.children.length; i < n1; i++) {
        var module_1 = root.children[i];
        for (var j = 0, n2 = module_1.children.length; j < n2; j++) {
            var contentNode = module_1.children[j];
            if (contentNode.id !== child.id &&
                (0, tandem_common_1.containsNestedTreeNodeById)(child.id, contentNode)) {
                return contentNode;
            }
        }
    }
});
exports.getInspectorContentNode = (0, tandem_common_1.memoize)(function (node, root) {
    return (0, exports.getInspectorContentNodeContainingChild)(node, root) || node;
});
exports.getInspectorInstanceShadow = (0, tandem_common_1.memoize)(function (inspectorNode) {
    return inspectorNode.children[0];
});
var getInspectorInstanceShadowContentNode = function (inspectorNode) {
    var shadow = (0, exports.getInspectorInstanceShadow)(inspectorNode);
    return shadow && shadow.children[0];
};
exports.getInspectorInstanceShadowContentNode = getInspectorInstanceShadowContentNode;
exports.getInspectorNodeParentShadow = (0, tandem_common_1.memoize)(function (inspectorNode, root) {
    var current = inspectorNode;
    while (current) {
        var parent_2 = (0, tandem_common_1.getParentTreeNode)(current.id, root);
        if (parent_2 && parent_2.name === InspectorTreeNodeName.SHADOW) {
            return parent_2;
        }
        current = parent_2;
    }
    return null;
});
exports.getSyntheticInspectorNode = (0, tandem_common_1.memoize)(function (node, document, rootInspector, graph) {
    var instancePath = (0, synthetic_1.getSyntheticInstancePath)(node, document, graph).join(".");
    return (0, tandem_common_1.flattenTreeNode)(rootInspector).find(function (child) {
        return (child.name === InspectorTreeNodeName.SOURCE_REP,
            child.instancePath === instancePath &&
                child.sourceNodeId === node.sourceNodeId);
    });
});
exports.getInspectorSyntheticNode = (0, tandem_common_1.memoize)(function (node, documents) {
    var instancePath = node.instancePath;
    var nodePath = (node.instancePath ? instancePath + "." : "") + node.sourceNodeId;
    var sourceMap = (0, synthetic_1.getSyntheticDocumentsSourceMap)(documents);
    // doesn't exist for root, shadows, or content nodes
    var syntheticNodeId = sourceMap[nodePath];
    return syntheticNodeId && (0, synthetic_1.getSyntheticNodeById)(syntheticNodeId, documents);
});
var addInstancePath = function (instancePath, parentAssocNode) {
    return (instancePath || "") + (instancePath ? "." : "") + parentAssocNode.id;
};
var collapseInspectorNode = function (node, root) {
    if (!node.expanded) {
        return node;
    }
    var collapse = function (node) {
        if (!node.expanded) {
            return node;
        }
        return __assign(__assign({}, node), { expanded: false, children: node.children.map(collapse) });
    };
    return (0, tandem_common_1.updateNestedNode)(node, root, collapse);
};
exports.collapseInspectorNode = collapseInspectorNode;
/*

Considerations:

- components
- slots
- plugs

To ignore:

- overrides


*/
//# sourceMappingURL=inspector.js.map

/***/ }),

/***/ "../paperclip/lib/loader.js":
/*!**********************************!*\
  !*** ../paperclip/lib/loader.js ***!
  \**********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

/**
TODOS:

- better error messaging for files that are not found
*/
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.loadEntry = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var migratePCModule = __webpack_require__(/*! paperclip-migrator */ "../paperclip-migrator/index.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var loadEntry = function (entryFileUri, options) { return __awaiter(void 0, void 0, void 0, function () {
    var graph, queue, currentUri, module_1, dependency;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                graph = __assign({}, (options.graph || tandem_common_1.EMPTY_OBJECT));
                queue = [entryFileUri];
                _a.label = 1;
            case 1:
                if (!queue.length) return [3 /*break*/, 3];
                currentUri = queue.shift();
                if (graph[currentUri]) {
                    return [3 /*break*/, 1];
                }
                return [4 /*yield*/, loadModule(currentUri, options)];
            case 2:
                module_1 = _a.sent();
                dependency = createDependency(currentUri, module_1);
                graph[currentUri] = dependency;
                return [3 /*break*/, 1];
            case 3: return [2 /*return*/, {
                    entry: graph[entryFileUri],
                    graph: graph
                }];
        }
    });
}); };
exports.loadEntry = loadEntry;
var createDependency = function (uri, content) { return ({
    uri: uri,
    content: content
}); };
var parseNodeSource = function (source) {
    return JSON.parse(source);
};
var loadModule = function (uri, options) { return __awaiter(void 0, void 0, void 0, function () {
    var content, source;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0: return [4 /*yield*/, options.openFile(uri)];
            case 1:
                content = _a.sent();
                if (!content) {
                    return [2 /*return*/, (0, dsl_1.createPCModule)()];
                }
                // TODO - support other extensions in the future like images
                if (/xml$/.test(uri)) {
                    // TODO - transform XML to JSON
                    throw new Error("XML is not supported yet");
                }
                else if (/pc$/.test(uri)) {
                    try {
                        source = parseNodeSource(content);
                        return [2 /*return*/, migratePCModule(source)];
                    }
                    catch (e) {
                        console.warn(e);
                        return [2 /*return*/, (0, dsl_1.createPCModule)()];
                    }
                }
                else if (!/json$/.test(uri)) {
                    throw new Error("Unsupported import ".concat(uri, "."));
                }
                else {
                    return [2 /*return*/, JSON.parse(content)];
                }
                return [2 /*return*/];
        }
    });
}); };
//# sourceMappingURL=loader.js.map

/***/ }),

/***/ "../paperclip/lib/ot.js":
/*!******************************!*\
  !*** ../paperclip/lib/ot.js ***!
  \******************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.patchTreeNode = exports.diffTreeNode = exports.createSetNodePropertyOperationalTransform = exports.TreeNodeOperationalTransformType = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var TreeNodeOperationalTransformType;
(function (TreeNodeOperationalTransformType) {
    TreeNodeOperationalTransformType[TreeNodeOperationalTransformType["SET_PROPERTY"] = 0] = "SET_PROPERTY";
    TreeNodeOperationalTransformType[TreeNodeOperationalTransformType["MOVE_CHILD"] = 1] = "MOVE_CHILD";
    TreeNodeOperationalTransformType[TreeNodeOperationalTransformType["REMOVE_CHILD"] = 2] = "REMOVE_CHILD";
    TreeNodeOperationalTransformType[TreeNodeOperationalTransformType["INSERT_CHILD"] = 3] = "INSERT_CHILD";
})(TreeNodeOperationalTransformType = exports.TreeNodeOperationalTransformType || (exports.TreeNodeOperationalTransformType = {}));
var createInsertChildNodeOperationalTransform = function (nodePath, child, index) { return ({
    type: TreeNodeOperationalTransformType.INSERT_CHILD,
    nodePath: nodePath,
    child: child,
    index: index
}); };
var createRemoveChildNodeOperationalTransform = function (nodePath, index) { return ({
    type: TreeNodeOperationalTransformType.REMOVE_CHILD,
    nodePath: nodePath,
    index: index
}); };
var createMoveChildNodeOperationalTransform = function (nodePath, oldIndex, newIndex) { return ({
    type: TreeNodeOperationalTransformType.MOVE_CHILD,
    nodePath: nodePath,
    oldIndex: oldIndex,
    newIndex: newIndex
}); };
var createSetNodePropertyOperationalTransform = function (nodePath, name, value) { return ({
    type: TreeNodeOperationalTransformType.SET_PROPERTY,
    nodePath: nodePath,
    name: name,
    value: value
}); };
exports.createSetNodePropertyOperationalTransform = createSetNodePropertyOperationalTransform;
var defaultComparator = function (a, b) {
    return (a.sourceNodeId ? a.sourceNodeId === b.sourceNodeId : a.id === b.id) ? 0 : -1;
};
exports.diffTreeNode = (0, tandem_common_1.memoize)(function (oldNode, newNode, ignoreDiffKeys, compareTreeNodes) {
    if (ignoreDiffKeys === void 0) { ignoreDiffKeys = IGNORE_DIFF_KEYS; }
    if (compareTreeNodes === void 0) { compareTreeNodes = defaultComparator; }
    var ots = _diffTreeNode(oldNode, newNode, [], [], ignoreDiffKeys, compareTreeNodes);
    return ots;
});
var IGNORE_DIFF_KEYS = {};
var PROHIBITED_DIFF_KEYS = {
    children: true,
    id: true
};
var _diffTreeNode = function (oldNode, newNode, nodePath, ots, ignoreDiffKeys, compareTreeNodes) {
    if (ots === void 0) { ots = []; }
    if (oldNode === newNode) {
        return ots;
    }
    for (var key in newNode) {
        if (ignoreDiffKeys[key] || PROHIBITED_DIFF_KEYS[key]) {
            continue;
        }
        var oldValue = oldNode[key];
        var newValue = newNode[key];
        if (oldValue !== newValue &&
            !(typeof newValue === "object" &&
                JSON.stringify(oldValue) === JSON.stringify(newValue))) {
            ots.push((0, exports.createSetNodePropertyOperationalTransform)(nodePath, key, newValue));
        }
    }
    var childOts = (0, tandem_common_1.diffArray)(oldNode.children, newNode.children, compareTreeNodes);
    for (var _i = 0, childOts_1 = childOts; _i < childOts_1.length; _i++) {
        var ot = childOts_1[_i];
        if (ot.type === tandem_common_1.ArrayOperationalTransformType.DELETE) {
            ots.push(createRemoveChildNodeOperationalTransform(nodePath, ot.index));
        }
        else if (ot.type === tandem_common_1.ArrayOperationalTransformType.UPDATE) {
            var uot = ot;
            var oldChild = oldNode.children[uot.originalOldIndex];
            _diffTreeNode(oldChild, uot.newValue, __spreadArray(__spreadArray([], nodePath, true), [uot.patchedOldIndex], false), ots, ignoreDiffKeys, compareTreeNodes);
            if (uot.index !== uot.patchedOldIndex) {
                ots.push(createMoveChildNodeOperationalTransform(nodePath, uot.originalOldIndex, uot.index));
            }
        }
        else if (ot.type === tandem_common_1.ArrayOperationalTransformType.INSERT) {
            var iot = ot;
            ots.push(createInsertChildNodeOperationalTransform(nodePath, iot.value, iot.index));
        }
    }
    return ots;
};
var patchTreeNode = function (ots, oldNode) {
    return ots.reduce(function (node, ot) {
        return (0, tandem_common_1.updateNestedNodeFromPath)(ot.nodePath, node, function (target) {
            var _a;
            switch (ot.type) {
                case TreeNodeOperationalTransformType.SET_PROPERTY: {
                    return __assign(__assign({}, target), (_a = {}, _a[ot.name] = ot.value, _a));
                }
                case TreeNodeOperationalTransformType.INSERT_CHILD: {
                    return __assign(__assign({}, target), { children: (0, tandem_common_1.arraySplice)(target.children, ot.index, 0, ot.child) });
                }
                case TreeNodeOperationalTransformType.REMOVE_CHILD: {
                    return __assign(__assign({}, target), { children: (0, tandem_common_1.arraySplice)(target.children, ot.index, 1) });
                }
                case TreeNodeOperationalTransformType.MOVE_CHILD: {
                    return __assign(__assign({}, target), { children: (0, tandem_common_1.arraySplice)((0, tandem_common_1.arraySplice)(target.children, ot.oldIndex, 1), ot.newIndex, 0, target.children[ot.oldIndex]) });
                }
            }
        });
    }, oldNode);
};
exports.patchTreeNode = patchTreeNode;
//# sourceMappingURL=ot.js.map

/***/ }),

/***/ "../paperclip/lib/reducer.js":
/*!***********************************!*\
  !*** ../paperclip/lib/reducer.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.paperclipReducer = void 0;
var fsbox_1 = __webpack_require__(/*! fsbox */ "../fsbox/index.js");
var actions_1 = __webpack_require__(/*! ./actions */ "../paperclip/lib/actions.js");
var edit_1 = __webpack_require__(/*! ./edit */ "../paperclip/lib/edit.js");
var graph_1 = __webpack_require__(/*! ./graph */ "../paperclip/lib/graph.js");
var constants_1 = __webpack_require__(/*! ./constants */ "../paperclip/lib/constants.js");
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

/***/ }),

/***/ "../paperclip/lib/runtime.js":
/*!***********************************!*\
  !*** ../paperclip/lib/runtime.js ***!
  \***********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

"use strict";

var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hookRemotePCRuntime = exports.createRemotePCRuntime = exports.createLocalPCRuntime = exports.RemotePCRuntime = void 0;
var events_1 = __webpack_require__(/*! events */ "../../node_modules/events/events.js");
var evaluate_1 = __webpack_require__(/*! ./evaluate */ "../paperclip/lib/evaluate.js");
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var ot_1 = __webpack_require__(/*! ./ot */ "../paperclip/lib/ot.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var LocalPCRuntime = /** @class */ (function (_super) {
    __extends(LocalPCRuntime, _super);
    function LocalPCRuntime(info) {
        var _this = _super.call(this) || this;
        _this._syntheticDocuments = {};
        if (info) {
            _this.setInfo(info);
        }
        return _this;
    }
    Object.defineProperty(LocalPCRuntime.prototype, "lastUpdatedAt", {
        get: function () {
            return this._lastUpdatedAt;
        },
        enumerable: false,
        configurable: true
    });
    LocalPCRuntime.prototype.setInfo = function (value, timestamp) {
        if (timestamp === void 0) { timestamp = Date.now(); }
        if (this._info === value) {
            return;
        }
        this._lastUpdatedAt = timestamp;
        this._info = value;
        this._evaluate();
    };
    LocalPCRuntime.prototype.getInfo = function () {
        return this._info;
    };
    LocalPCRuntime.prototype._evaluate = function () {
        var _this = this;
        if (this._evaluating) {
            return;
        }
        this._evaluating = true;
        // This is primarily here to prevent synchronous access
        // synthetic objects after dependency graph patching
        setTimeout(function () {
            _this._evaluating = false;
            _this._evaluateNow();
        });
    };
    Object.defineProperty(LocalPCRuntime.prototype, "syntheticDocuments", {
        get: function () {
            return Object.values(this._syntheticDocuments);
        },
        enumerable: false,
        configurable: true
    });
    LocalPCRuntime.prototype._evaluateNow = function () {
        var marker = (0, tandem_common_1.pmark)("LocalPCRuntime._evaluateNow()");
        var diffs = {};
        var newDocumentMap = {};
        var documentMap = {};
        var deletedDocumentIds = [];
        var newSyntheticDocuments = (0, evaluate_1.evaluateDependencyGraph)(this._info.graph, this._info.rootDirectory, this._info.variants, this._info.priorityUris);
        for (var uri in newSyntheticDocuments) {
            var newSyntheticDocument = newSyntheticDocuments[uri];
            var prevSyntheticDocument = this._syntheticDocuments[uri];
            if (prevSyntheticDocument) {
                var ots = (0, ot_1.diffTreeNode)(prevSyntheticDocument, newSyntheticDocument);
                if (ots.length) {
                    prevSyntheticDocument = documentMap[uri] = (0, ot_1.patchTreeNode)(ots, prevSyntheticDocument);
                    diffs[uri] = ots;
                }
                else {
                    documentMap[uri] = prevSyntheticDocument;
                }
            }
            else {
                newDocumentMap[uri] = documentMap[uri] = newSyntheticDocument;
            }
        }
        for (var uri in this._syntheticDocuments) {
            if (!this._info.graph[uri]) {
                deletedDocumentIds.push(uri);
                delete this._syntheticDocuments[uri];
            }
        }
        Object.assign(this._syntheticDocuments, documentMap);
        marker.end();
        this.emit("evaluate", newDocumentMap, diffs, deletedDocumentIds, this._lastUpdatedAt);
    };
    return LocalPCRuntime;
}(events_1.EventEmitter));
var RemotePCRuntime = /** @class */ (function (_super) {
    __extends(RemotePCRuntime, _super);
    function RemotePCRuntime(_remote, info) {
        var _this = _super.call(this) || this;
        _this._remote = _remote;
        _this._onRemoteMessage = function (event) {
            var _a = event.data, type = _a.type, payload = _a.payload;
            var marker = (0, tandem_common_1.pmark)("Runtime._onRemoteMessage()");
            if (type === "fetchInfo") {
                _this._remote.postMessage({
                    type: "info",
                    payload: _this._info
                });
            }
            else if (type === "evaluate") {
                var newDocuments = payload[0], diffs = payload[1], deletedDocumentUris = payload[2], timestamp = payload[3];
                _this._syntheticDocuments = __assign(__assign({}, _this._syntheticDocuments), newDocuments);
                for (var uri in diffs) {
                    _this._syntheticDocuments[uri] = (0, ot_1.patchTreeNode)(diffs[uri], _this._syntheticDocuments[uri]);
                }
                for (var _i = 0, deletedDocumentUris_1 = deletedDocumentUris; _i < deletedDocumentUris_1.length; _i++) {
                    var uri = deletedDocumentUris_1[_i];
                    delete _this._syntheticDocuments[uri];
                }
                _this.emit("evaluate", newDocuments, diffs, deletedDocumentUris, timestamp);
            }
            else if (type === "allSyntheticDocuments") {
                _this._syntheticDocuments = payload;
                _this.emit("evaluate", payload, {}, [], Date.now());
            }
            marker.end();
        };
        if (info) {
            _this.setInfo(info);
        }
        _this._remote.addEventListener("message", _this._onRemoteMessage);
        _this._remote.postMessage({ type: "fetchAllSyntheticDocuments" });
        return _this;
    }
    Object.defineProperty(RemotePCRuntime.prototype, "lastUpdatedAt", {
        get: function () {
            return this._lastUpdatedAt;
        },
        enumerable: false,
        configurable: true
    });
    Object.defineProperty(RemotePCRuntime.prototype, "syntheticDocuments", {
        get: function () {
            return Object.values(this._syntheticDocuments);
        },
        enumerable: false,
        configurable: true
    });
    RemotePCRuntime.prototype.getInfo = function () {
        return this._info;
    };
    RemotePCRuntime.prototype.setInfo = function (value, timestamp) {
        if (timestamp === void 0) { timestamp = Date.now(); }
        if (this._info === value) {
            return;
        }
        var oldInfo = this._info;
        this._info = value;
        var changes = {};
        for (var uri in value.graph) {
            var oldDep = oldInfo && oldInfo.graph[uri];
            if (oldDep) {
                var ots = (0, ot_1.diffTreeNode)(oldDep.content, value.graph[uri].content);
                changes[uri] = ots;
            }
            else {
                changes[uri] = value.graph[uri].content;
            }
        }
        if (Object.keys(changes).length ||
            !(0, lodash_1.isEqual)(value.variants, (oldInfo || tandem_common_1.EMPTY_OBJECT).variants)) {
            this._remote.postMessage({
                type: "infoChanges",
                payload: {
                    changes: changes,
                    variants: value.variants,
                    priorityUris: value.priorityUris,
                    lastUpdatedAt: (this._lastUpdatedAt = timestamp)
                }
            });
        }
    };
    return RemotePCRuntime;
}(events_1.EventEmitter));
exports.RemotePCRuntime = RemotePCRuntime;
var createLocalPCRuntime = function (info) {
    return new LocalPCRuntime(info);
};
exports.createLocalPCRuntime = createLocalPCRuntime;
var createRemotePCRuntime = function (remote, info) { return new RemotePCRuntime(remote, info); };
exports.createRemotePCRuntime = createRemotePCRuntime;
var patchDependencyGraph = function (changes, oldGraph) {
    var newGraph = {};
    for (var uri in changes) {
        var change = changes[uri];
        if (Array.isArray(change)) {
            newGraph[uri] = change.length
                ? (0, dsl_1.createPCDependency)(uri, (0, ot_1.patchTreeNode)(change, oldGraph[uri].content))
                : oldGraph[uri];
        }
        else {
            newGraph[uri] = (0, dsl_1.createPCDependency)(uri, change);
        }
    }
    return newGraph;
};
console.log("OK");
var hookRemotePCRuntime = function (localRuntime, remote) { return __awaiter(void 0, void 0, void 0, function () {
    var _sentDocuments, sendDocuments;
    return __generator(this, function (_a) {
        _sentDocuments = false;
        sendDocuments = function () {
            _sentDocuments = true;
            remote.postMessage({
                type: "allSyntheticDocuments",
                payload: localRuntime.syntheticDocuments
            });
        };
        remote.addEventListener("message", function (event) {
            console.log("FET");
            var _a = event.data, type = _a.type, payload = _a.payload;
            if (type === "fetchAllSyntheticDocuments") {
                sendDocuments();
            }
            else if (type === "info") {
                localRuntime.setInfo(payload);
            }
            else if (type === "infoChanges") {
                var localInfo = localRuntime.getInfo() || tandem_common_1.EMPTY_OBJECT;
                localRuntime.setInfo(__assign(__assign({}, localInfo), { variants: payload.variants, graph: patchDependencyGraph(payload.changes, localInfo.graph), priorityUris: payload.priorityUris }), payload.lastUpdatedAt);
            }
        });
        remote.postMessage({ type: "fetchInfo" });
        localRuntime.on("evaluate", function () {
            var args = [];
            for (var _i = 0; _i < arguments.length; _i++) {
                args[_i] = arguments[_i];
            }
            if (_sentDocuments) {
                remote.postMessage({ type: "evaluate", payload: args });
            }
            else {
                sendDocuments();
            }
        });
        return [2 /*return*/];
    });
}); };
exports.hookRemotePCRuntime = hookRemotePCRuntime;
//# sourceMappingURL=runtime.js.map

/***/ }),

/***/ "../paperclip/lib/saga.js":
/*!********************************!*\
  !*** ../paperclip/lib/saga.js ***!
  \********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.createPaperclipSaga = void 0;
var redux_saga_1 = __webpack_require__(/*! redux-saga */ "../../node_modules/redux-saga/es/index.js");
var effects_1 = __webpack_require__(/*! redux-saga/effects */ "../../node_modules/redux-saga/es/effects.js");
var actions_1 = __webpack_require__(/*! ./actions */ "../paperclip/lib/actions.js");
var dom_renderer_1 = __webpack_require__(/*! ./dom-renderer */ "../paperclip/lib/dom-renderer.js");
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var edit_1 = __webpack_require__(/*! ./edit */ "../paperclip/lib/edit.js");
var synthetic_1 = __webpack_require__(/*! ./synthetic */ "../paperclip/lib/synthetic.js");
var fsbox_1 = __webpack_require__(/*! fsbox */ "../fsbox/index.js");
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
                                            if (false) {}
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
                        if (false) {}
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
                                        if (false) {}
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
                        if (false) {}
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

/***/ }),

/***/ "../paperclip/lib/style.js":
/*!*********************************!*\
  !*** ../paperclip/lib/style.js ***!
  \*********************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.hasTextStyles = exports.getTextStyles = exports.filterTextStyles = exports.computeStyleInfo = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var inspector_1 = __webpack_require__(/*! ./inspector */ "../paperclip/lib/inspector.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var DEFAULT_COMPUTE_STYLE_OPTIONS = {
    styleMixins: true,
    inheritedStyles: true,
    overrides: true,
    parentStyles: true,
    self: true
};
// TODO - take single inspector node and use merging function instead of taking
// array here.
exports.computeStyleInfo = (0, tandem_common_1.memoize)(function (inspectorNode, rootInspectorNode, variant, graph, options) {
    if (options === void 0) { options = DEFAULT_COMPUTE_STYLE_OPTIONS; }
    var style = {};
    var styleOverridesMap = {};
    var sourceNode = (0, dsl_1.getPCNode)(inspectorNode.sourceNodeId, graph);
    var current = sourceNode;
    if (options.parentStyles !== false) {
        while ((0, dsl_1.extendsComponent)(current)) {
            var parent_1 = (0, dsl_1.getPCNode)(current.is, graph);
            if ((0, dsl_1.isPCComponentOrInstance)(parent_1)) {
                // defaults -- parents cannot disable
                (0, lodash_1.defaults)(style, parent_1.style);
            }
            current = parent_1;
        }
    }
    if (options.self !== false) {
        Object.assign(style, sourceNode.style);
    }
    if (options.styleMixins !== false && sourceNode.styleMixins) {
        (0, lodash_1.defaults)(style, computeMixinStyle(sourceNode, graph, false));
    }
    if (options.overrides !== false) {
        var overrides = (0, inspector_1.getInspectorNodeOverrides)(inspectorNode, rootInspectorNode, variant, graph);
        for (var _i = 0, overrides_1 = overrides; _i < overrides_1.length; _i++) {
            var override = overrides_1[_i];
            if (override.propertyName === dsl_1.PCOverridablePropertyName.STYLE) {
                for (var key in override.value) {
                    if (!styleOverridesMap[key]) {
                        styleOverridesMap[key] = [];
                    }
                    styleOverridesMap[key].push(override);
                    style[key] = override.value[key];
                }
            }
        }
    }
    var styleInheritanceMap = {};
    if (options.inheritedStyles !== false) {
        var parent_2 = (0, tandem_common_1.getParentTreeNode)(inspectorNode.id, rootInspectorNode);
        while (parent_2) {
            if (parent_2.name === inspector_1.InspectorTreeNodeName.SOURCE_REP) {
                var parentSource = (0, dsl_1.getPCNode)(parent_2.sourceNodeId, graph);
                if ((0, dsl_1.isElementLikePCNode)(parentSource)) {
                    var inheritedStyle = (0, lodash_1.pick)((0, exports.computeStyleInfo)(parent_2, rootInspectorNode, variant, graph).style, dsl_1.INHERITABLE_STYLE_NAMES);
                    for (var key in inheritedStyle) {
                        if (!style[key]) {
                            styleInheritanceMap[key] = parent_2;
                            style[key] = inheritedStyle[key];
                        }
                    }
                }
            }
            parent_2 = (0, tandem_common_1.getParentTreeNode)(parent_2.id, rootInspectorNode);
        }
    }
    return {
        sourceNode: sourceNode,
        styleOverridesMap: styleOverridesMap,
        styleInheritanceMap: styleInheritanceMap,
        style: style
    };
});
var computeMixinStyle = function (node, graph, includeSelf) {
    var style = {};
    if (includeSelf) {
        Object.assign(style, node.style);
    }
    if (node.styleMixins) {
        var sortedStyleMixinIds = (0, dsl_1.getSortedStyleMixinIds)(node);
        for (var _i = 0, sortedStyleMixinIds_1 = sortedStyleMixinIds; _i < sortedStyleMixinIds_1.length; _i++) {
            var styleMixinId = sortedStyleMixinIds_1[_i];
            var styleMixin = (0, dsl_1.getPCNode)(styleMixinId, graph);
            // may have been deleted by user
            if (!styleMixin) {
                continue;
            }
            (0, lodash_1.defaults)(style, computeMixinStyle(styleMixin, graph, true));
        }
    }
    return style;
};
var filterTextStyles = function (style) {
    return (0, lodash_1.pick)(style, dsl_1.TEXT_STYLE_NAMES);
};
exports.filterTextStyles = filterTextStyles;
var getTextStyles = function (inspectorNode, rootInspectorNode, variant, graph) {
    return (0, exports.filterTextStyles)((0, exports.computeStyleInfo)(inspectorNode, rootInspectorNode, variant, graph, {
        styleMixins: false,
        inheritedStyles: false,
        overrides: true,
        parentStyles: false,
        self: true
    }).style);
};
exports.getTextStyles = getTextStyles;
var hasTextStyles = function (inspectorNode, rootInspectorNode, variant, graph) {
    return Boolean(Object.keys((0, exports.getTextStyles)(inspectorNode, rootInspectorNode, variant, graph))
        .length);
};
exports.hasTextStyles = hasTextStyles;
//# sourceMappingURL=style.js.map

/***/ }),

/***/ "../paperclip/lib/synthetic-layout.js":
/*!********************************************!*\
  !*** ../paperclip/lib/synthetic-layout.js ***!
  \********************************************/
/***/ ((__unused_webpack_module, exports, __webpack_require__) => {

"use strict";

Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.convertFixedBoundsToNewAbsoluteRelativeToParent = exports.convertFixedBoundsToRelative = exports.getFixedSyntheticVisibleNodeStaticPosition = exports.getRelativeParent = exports.isAbsolutelyPositionedNode = exports.isRelativeNode = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var Axis;
(function (Axis) {
    Axis[Axis["X"] = 0] = "X";
    Axis[Axis["Y"] = 1] = "Y";
})(Axis || (Axis = {}));
var getStyleProp = function (node, prop, defaultValue) {
    var style = node.style;
    return (style && style[prop]) || defaultValue;
};
var isRelativeNode = function (node) {
    return /relative|absolute|fixed/i.test(getStyleProp(node, "position", "static"));
};
exports.isRelativeNode = isRelativeNode;
var isAbsolutelyPositionedNode = function (node) {
    return /absolute|fixed/i.test(getStyleProp(node, "position", "static"));
};
exports.isAbsolutelyPositionedNode = isAbsolutelyPositionedNode;
exports.getRelativeParent = (0, tandem_common_1.memoize)(function (node, document, frame) {
    return ((0, tandem_common_1.findTreeNodeParent)(node.id, document, exports.isRelativeNode) ||
        (0, tandem_common_1.getNestedTreeNodeById)(frame.syntheticContentNodeId, document));
});
var measurementToPx = function (measurment, axis, node, frame) {
    if (!measurment || measurment === "auto") {
        return 0;
    }
    var _a = measurment.match(/([-\d\.]+)(.+)/), value = _a[1], unit = _a[2];
    if (unit === "px") {
        return Number(value);
    }
    throw new Error("Cannot convert ".concat(unit, " to absolute"));
};
exports.getFixedSyntheticVisibleNodeStaticPosition = (0, tandem_common_1.memoize)(function (node, document, frame) {
    var position = getStyleProp(node, "position");
    if (position === "fixed" || frame.syntheticContentNodeId === node.id) {
        return {
            left: 0,
            top: 0
        };
    }
    if (position === "absolute") {
        var relativeParent = (0, exports.getRelativeParent)(node, document, frame);
        return frame.computed[relativeParent.id].bounds;
    }
    return {
        left: frame.computed[node.id].bounds.left -
            measurementToPx(frame.computed[node.id].style.left, Axis.X, node, frame),
        top: frame.computed[node.id].bounds.top -
            measurementToPx(frame.computed[node.id].style.top, Axis.Y, node, frame)
    };
});
var convertFixedBoundsToRelative = function (bounds, node, document, frame) {
    var staticPosition = (0, exports.getFixedSyntheticVisibleNodeStaticPosition)(node, document, frame);
    return (0, tandem_common_1.shiftBounds)(bounds, {
        left: -staticPosition.left,
        top: -staticPosition.top
    });
};
exports.convertFixedBoundsToRelative = convertFixedBoundsToRelative;
/**
 * Used to maintian the same position of a node when it's moved to another parent.  This function
 * assumes that the node is translated to be absolutely positioned since there moving a relatively positioned
 * element to a parent will have cascading affects to other children. We don't want that. Also, moving a relatively
 * positioned element to another parent would need to consider the layout engine (we don't have access to that directly), so
 * the static position of the element cannot easily be computed (unless we want to mock the DOM 😅).
 */
var convertFixedBoundsToNewAbsoluteRelativeToParent = function (bounds, newParent, document, frame) {
    var relativeParent = (0, exports.isRelativeNode)(newParent)
        ? newParent
        : (0, exports.getRelativeParent)(newParent, document, frame);
    var relativeParentBounds = frame.computed[relativeParent.id].bounds;
    // based on abs parent of new child.
    return (0, tandem_common_1.moveBounds)(bounds, {
        left: bounds.left - relativeParentBounds.left,
        top: bounds.top - relativeParentBounds.top
    });
};
exports.convertFixedBoundsToNewAbsoluteRelativeToParent = convertFixedBoundsToNewAbsoluteRelativeToParent;
//# sourceMappingURL=synthetic-layout.js.map

/***/ }),

/***/ "../paperclip/lib/synthetic.js":
/*!*************************************!*\
  !*** ../paperclip/lib/synthetic.js ***!
  \*************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.updateSyntheticVisibleNodeMetadata = exports.upsertSyntheticDocument = exports.isSyntheticNodeImmutable = exports.syntheticNodeIsInShadow = exports.getSyntheticDocumentsSourceMap = exports.getSyntheticSourceMap = exports.getSyntheticInstancePath = exports.getNearestComponentInstances = exports.isComponentOrInstance = exports.getAllParentComponentInstance = exports.findFurthestParentComponentInstance = exports.findClosestParentComponentInstance = exports.findInstanceOfPCNode = exports.getSyntheticNodeSourceDependency = exports.getSyntheticNodeById = exports.getSyntheticNode = exports.getSyntheticSourceUri = exports.getSyntheticVisibleNodeDocument = exports.getSyntheticDocumentDependencyUri = exports.getSyntheticContentNode = exports.getSyntheticDocumentByDependencyUri = exports.getSyntheticSourceFrame = exports.getSyntheticSourceNode = exports._getSyntheticNodeStyleColors = exports.getSyntheticNodeStyleColors = exports.getInheritedAndSelfOverrides = exports.isSyntheticVisibleNodeResizable = exports.isSyntheticVisibleNodeMovable = exports.isSyntheticVisibleNode = exports.isSyntheticTextNode = exports.isSyntheticElement = exports.isSyntheticDocument = exports.isSyntheticInstanceElement = exports.isSyntheticContentNode = exports.isSyntheticVisibleNodeRoot = exports.isPaperclipState = exports.createSytheticDocument = exports.SYNTHETIC_DOCUMENT_NODE_NAME = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var ot_1 = __webpack_require__(/*! ./ot */ "../paperclip/lib/ot.js");
/*------------------------------------------
 * STATE
 *-----------------------------------------*/
exports.SYNTHETIC_DOCUMENT_NODE_NAME = "document";
/*------------------------------------------
 * STATE FACTORIES
 *-----------------------------------------*/
var createSytheticDocument = function (sourceNodeId, children) { return ({
    id: (0, tandem_common_1.generateUID)(),
    metadata: tandem_common_1.EMPTY_OBJECT,
    sourceNodeId: sourceNodeId,
    name: exports.SYNTHETIC_DOCUMENT_NODE_NAME,
    children: children || tandem_common_1.EMPTY_ARRAY
}); };
exports.createSytheticDocument = createSytheticDocument;
/*------------------------------------------
 * TYPE UTILS
 *-----------------------------------------*/
var isPaperclipState = function (state) { return Boolean(state.frames); };
exports.isPaperclipState = isPaperclipState;
var isSyntheticVisibleNodeRoot = function (node, graph) { return (0, exports.getSyntheticSourceFrame)(node, graph).children[0].id === node.sourceNodeId; };
exports.isSyntheticVisibleNodeRoot = isSyntheticVisibleNodeRoot;
var isSyntheticContentNode = function (node, graph) {
    var sourceNode = (0, exports.getSyntheticSourceNode)(node, graph);
    var module = (0, dsl_1.getPCNodeModule)(sourceNode.id, graph);
    return module.children.indexOf(sourceNode) !== -1;
};
exports.isSyntheticContentNode = isSyntheticContentNode;
var isSyntheticInstanceElement = function (node) {
    return Boolean(node.variant);
};
exports.isSyntheticInstanceElement = isSyntheticInstanceElement;
var isSyntheticDocument = function (node) {
    return node.name === exports.SYNTHETIC_DOCUMENT_NODE_NAME;
};
exports.isSyntheticDocument = isSyntheticDocument;
var isSyntheticElement = function (node) {
    return Boolean(node.attributes);
};
exports.isSyntheticElement = isSyntheticElement;
var isSyntheticTextNode = function (node) {
    return node.name === dsl_1.PCSourceTagNames.TEXT;
};
exports.isSyntheticTextNode = isSyntheticTextNode;
var isSyntheticVisibleNode = function (node) {
    var sn = node;
    if (!sn)
        return false;
    return Boolean(sn.sourceNodeId) && Boolean(sn.name);
};
exports.isSyntheticVisibleNode = isSyntheticVisibleNode;
var isSyntheticVisibleNodeMovable = function (node, graph) {
    return (0, exports.isSyntheticContentNode)(node, graph) ||
        /fixed|relative|absolute/.test(node.style.position || "static");
};
exports.isSyntheticVisibleNodeMovable = isSyntheticVisibleNodeMovable;
var isSyntheticVisibleNodeResizable = function (node, graph) {
    return (0, exports.isSyntheticContentNode)(node, graph) ||
        (0, exports.isSyntheticVisibleNodeMovable)(node, graph) ||
        /block|inline-block|flex|inline-flex/.test(node.style.display || "inline");
};
exports.isSyntheticVisibleNodeResizable = isSyntheticVisibleNodeResizable;
/*------------------------------------------
 * GETTERS
 *-----------------------------------------*/
exports.getInheritedAndSelfOverrides = (0, tandem_common_1.memoize)(function (instance, document, graph, variantId) {
    var parents = (0, tandem_common_1.filterTreeNodeParents)(instance.id, document, function () { return true; });
    return parents.reduce(function (overrides, parent) {
        return __spreadArray(__spreadArray([], (0, dsl_1.getOverrides)((0, exports.getSyntheticSourceNode)(parent, graph)).filter(function (override) {
            return override.variantId == variantId &&
                override.targetIdPath.indexOf(instance.sourceNodeId) !== -1;
        }), true), overrides, true);
    }, (0, dsl_1.getPCVariantOverrides)((0, exports.getSyntheticSourceNode)(instance, graph), variantId));
});
exports.getSyntheticNodeStyleColors = (0, tandem_common_1.memoize)(function (node) {
    return (0, lodash_1.uniq)((0, exports._getSyntheticNodeStyleColors)(node));
});
exports._getSyntheticNodeStyleColors = (0, tandem_common_1.memoize)(function (node) {
    var colors = [];
    if (node.style) {
        for (var key in node.style) {
            var value = node.style[key];
            var colorParts = String(value).match(/((rgba?|hsl)\(.*\)|#[^\s]+)/);
            if (colorParts) {
                colors.push(colorParts[1]);
            }
        }
    }
    for (var i = 0, length_1 = node.children.length; i < length_1; i++) {
        colors.push.apply(colors, (0, exports._getSyntheticNodeStyleColors)(node.children[i]));
    }
    return colors;
});
var getSyntheticSourceNode = function (node, graph) {
    return (0, dsl_1.getPCNode)(node.sourceNodeId, graph);
};
exports.getSyntheticSourceNode = getSyntheticSourceNode;
var getSyntheticSourceFrame = function (node, graph) {
    return (0, dsl_1.getPCNodeContentNode)(node.sourceNodeId, (0, dsl_1.getPCNodeDependency)(node.sourceNodeId, graph).content);
};
exports.getSyntheticSourceFrame = getSyntheticSourceFrame;
exports.getSyntheticDocumentByDependencyUri = (0, tandem_common_1.memoize)(function (uri, documents, graph) {
    return documents.find(function (document) {
        var dependency = (0, dsl_1.getPCNodeDependency)(document.sourceNodeId, graph);
        return dependency && dependency.uri === uri;
    });
});
exports.getSyntheticContentNode = (0, tandem_common_1.memoize)(function (node, documentOrDocuments) {
    var documents = Array.isArray(documentOrDocuments)
        ? documentOrDocuments
        : [documentOrDocuments];
    var document = (0, exports.getSyntheticVisibleNodeDocument)(node.id, documents);
    return document.children.find(function (contentNode) {
        return contentNode.id === node.id ||
            (0, tandem_common_1.containsNestedTreeNodeById)(node.id, contentNode);
    });
});
var getSyntheticDocumentDependencyUri = function (document, graph) {
    return (0, dsl_1.getPCNodeDependency)(document.sourceNodeId, graph).uri;
};
exports.getSyntheticDocumentDependencyUri = getSyntheticDocumentDependencyUri;
exports.getSyntheticVisibleNodeDocument = (0, tandem_common_1.memoize)(function (syntheticNodeId, syntheticDocuments) {
    return syntheticDocuments.find(function (document) {
        return (0, tandem_common_1.containsNestedTreeNodeById)(syntheticNodeId, document);
    });
});
var getSyntheticSourceUri = function (syntheticNode, graph) {
    return (0, dsl_1.getPCNodeDependency)(syntheticNode.sourceNodeId, graph).uri;
};
exports.getSyntheticSourceUri = getSyntheticSourceUri;
var getSyntheticNode = function (node, documents) { return (0, exports.getSyntheticNodeById)(node.id, documents); };
exports.getSyntheticNode = getSyntheticNode;
exports.getSyntheticNodeById = (0, tandem_common_1.memoize)(function (syntheticNodeId, documents) {
    var document = (0, exports.getSyntheticVisibleNodeDocument)(syntheticNodeId, documents);
    if (!document) {
        return null;
    }
    return (0, tandem_common_1.getNestedTreeNodeById)(syntheticNodeId, document);
});
var getSyntheticNodeSourceDependency = function (node, graph) { return (0, dsl_1.getPCNodeDependency)(node.sourceNodeId, graph); };
exports.getSyntheticNodeSourceDependency = getSyntheticNodeSourceDependency;
exports.findInstanceOfPCNode = (0, tandem_common_1.memoize)(function (node, documents, graph) {
    for (var _i = 0, documents_1 = documents; _i < documents_1.length; _i++) {
        var document_1 = documents_1[_i];
        var instance = (0, tandem_common_1.findNestedNode)(document_1, function (instance) {
            return instance.sourceNodeId === node.id;
        });
        if (instance) {
            return instance;
        }
    }
    return null;
});
exports.findClosestParentComponentInstance = (0, tandem_common_1.memoize)(function (node, root, graph) {
    return (0, tandem_common_1.findTreeNodeParent)(node.id, root, function (parent) {
        return (0, exports.isComponentOrInstance)(parent, graph);
    });
});
exports.findFurthestParentComponentInstance = (0, tandem_common_1.memoize)(function (node, root, graph) {
    var parentComponentInstances = (0, exports.getAllParentComponentInstance)(node, root, graph);
    return parentComponentInstances.length
        ? parentComponentInstances[parentComponentInstances.length - 1]
        : null;
});
exports.getAllParentComponentInstance = (0, tandem_common_1.memoize)(function (node, root, graph) {
    var current = (0, exports.findClosestParentComponentInstance)(node, root, graph);
    if (!current)
        return [];
    var instances = [current];
    while (current) {
        var parent_1 = (0, exports.findClosestParentComponentInstance)(current, root, graph);
        if (!parent_1)
            break;
        current = parent_1;
        instances.push(current);
    }
    return instances;
});
var isComponentOrInstance = function (node, graph) {
    var sourceNode = (0, exports.getSyntheticSourceNode)(node, graph);
    // source node may have been deleted, so return false is that's the case
    if (!sourceNode) {
        return false;
    }
    return (sourceNode.name === dsl_1.PCSourceTagNames.COMPONENT ||
        sourceNode.name === dsl_1.PCSourceTagNames.COMPONENT_INSTANCE);
};
exports.isComponentOrInstance = isComponentOrInstance;
exports.getNearestComponentInstances = (0, tandem_common_1.memoize)(function (node, root, graph) {
    var instances = (0, exports.getAllParentComponentInstance)(node, root, graph);
    if ((0, exports.isComponentOrInstance)(node, graph)) {
        return __spreadArray([node], instances, true);
    }
    return instances;
});
exports.getSyntheticInstancePath = (0, tandem_common_1.memoize)(function (node, root, graph) {
    var nodePath = (0, exports.getAllParentComponentInstance)(node, root, graph).reduce(function (nodePath, instance) {
        var lastId = (0, lodash_1.last)(nodePath);
        var currentSourceNode = (0, exports.getSyntheticSourceNode)(instance, graph);
        var current = currentSourceNode;
        while (current && (0, dsl_1.extendsComponent)(current)) {
            current = (0, dsl_1.getPCNode)(current.is, graph);
            if ((0, tandem_common_1.containsNestedTreeNodeById)(lastId, current)) {
                return __spreadArray(__spreadArray([], nodePath, true), [currentSourceNode.id], false);
            }
        }
        return nodePath;
    }, [node.sourceNodeId]);
    // only want instance path, so strip initial source node ID
    return nodePath.slice(1).reverse();
});
exports.getSyntheticSourceMap = (0, tandem_common_1.memoize)(function (current) {
    return Object.assign.apply(Object, __spreadArray([{}], getSyntheticSourceFlatMap(current), false));
});
exports.getSyntheticDocumentsSourceMap = (0, tandem_common_1.memoize)(function (documents) {
    var flatMap = [];
    for (var i = 0, length_2 = documents.length; i < length_2; i++) {
        flatMap.push((0, exports.getSyntheticSourceMap)(documents[i]));
    }
    return Object.assign.apply(Object, __spreadArray([{}], flatMap, false));
});
var getSyntheticSourceFlatMap = (0, tandem_common_1.memoize)(function (current) {
    var _a;
    var path = current.instancePath
        ? current.instancePath + "." + current.sourceNodeId
        : current.sourceNodeId;
    var map = (_a = {}, _a[path] = current.id, _a);
    var flatMap = [map];
    for (var i = 0, length_3 = current.children.length; i < length_3; i++) {
        flatMap.push.apply(flatMap, getSyntheticSourceFlatMap(current.children[i]));
    }
    return flatMap;
});
var syntheticNodeIsInShadow = function (node, root, graph) { return (0, exports.getSyntheticInstancePath)(node, root, graph).length > 0; };
exports.syntheticNodeIsInShadow = syntheticNodeIsInShadow;
// alias
exports.isSyntheticNodeImmutable = exports.syntheticNodeIsInShadow;
/*------------------------------------------
 * SETTERS
 *-----------------------------------------*/
var upsertSyntheticDocument = function (newDocument, oldDocuments, graph) {
    var oldDocumentIndex = oldDocuments.findIndex(function (oldDocument) { return oldDocument.sourceNodeId === newDocument.sourceNodeId; });
    if (oldDocumentIndex === -1) {
        return __spreadArray(__spreadArray([], oldDocuments, true), [newDocument], false);
    }
    var oldDocument = oldDocuments[oldDocumentIndex];
    return (0, tandem_common_1.arraySplice)(oldDocuments, oldDocumentIndex, 1, (0, ot_1.patchTreeNode)((0, ot_1.diffTreeNode)(oldDocument, newDocument), oldDocument));
};
exports.upsertSyntheticDocument = upsertSyntheticDocument;
var updateSyntheticVisibleNodeMetadata = function (metadata, node, document) {
    return (0, tandem_common_1.updateNestedNode)(node, document, function (node) { return (__assign(__assign({}, node), { metadata: __assign(__assign({}, node.metadata), metadata) })); });
};
exports.updateSyntheticVisibleNodeMetadata = updateSyntheticVisibleNodeMetadata;
//# sourceMappingURL=synthetic.js.map

/***/ }),

/***/ "../paperclip/lib/utils.js":
/*!*********************************!*\
  !*** ../paperclip/lib/utils.js ***!
  \*********************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.elevateTypographyToMixins = exports.elevateColorsToGlobal = exports.elevateCommonStylesToGlobal = exports.xmlToPCNode = void 0;
var xml = __webpack_require__(/*! xml-js */ "../../node_modules/xml-js/lib/index.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var FRAME_PADDING = 50;
// TODO - check for SVG and convert props to style
var xmlToPCNode = function (source) {
    var root = JSON.parse(xml.xml2json(source)).elements[0];
    return convertXMLJSONToPCNode(root);
};
exports.xmlToPCNode = xmlToPCNode;
var convertXMLJSONToPCNode = function (node) {
    if (node.type === "element") {
        return (0, dsl_1.createPCElement)(node.name, {}, node.attributes, (node.elements || tandem_common_1.EMPTY_ARRAY).map(convertXMLJSONToPCNode));
    }
    else if (node.type === "text") {
        return (0, dsl_1.createPCTextNode)(node.text);
    }
    else {
        console.error(node);
        throw new Error("Unsupported");
    }
};
var elevateCommonStylesToGlobal = function (root, dest) {
    var _a, _b;
    if (dest === void 0) { dest = root; }
    _a = (0, exports.elevateColorsToGlobal)(root, dest), root = _a[0], dest = _a[1];
    // don't do this for now because it causes messiness. Instead focus on
    // tooling that makes it easier to elevate typography to mixins.
    _b = (0, exports.elevateTypographyToMixins)(root, dest), root = _b[0], dest = _b[1];
    return [root, dest];
};
exports.elevateCommonStylesToGlobal = elevateCommonStylesToGlobal;
var elevateColorsToGlobal = function (root, dest) {
    if (dest === void 0) { dest = root; }
    var colorVarMap = {};
    for (var _i = 0, _a = dest.children; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.name === dsl_1.PCSourceTagNames.VARIABLE &&
            child.type === dsl_1.PCVariableType.COLOR) {
            colorVarMap[child.value] = child;
        }
    }
    var moveColorsToMap = function (node) {
        if (node.name === dsl_1.PCSourceTagNames.ELEMENT ||
            node.name === dsl_1.PCSourceTagNames.TEXT) {
            var newStyle = void 0;
            for (var key in node.style) {
                var value = node.style[key];
                var colors = findCSSColors(node.style[key]);
                if (colors.length) {
                    if (!newStyle) {
                        newStyle = __assign({}, node.style);
                    }
                    for (var _i = 0, colors_1 = colors; _i < colors_1.length; _i++) {
                        var color = colors_1[_i];
                        var colorVar = colorVarMap[color] ||
                            (colorVarMap[color] = {
                                name: dsl_1.PCSourceTagNames.VARIABLE,
                                label: "Color ".concat(Object.keys(colorVarMap).length + 1),
                                id: "via".concat(node.id),
                                value: color,
                                type: dsl_1.PCVariableType.COLOR,
                                children: tandem_common_1.EMPTY_ARRAY,
                                metadata: tandem_common_1.EMPTY_OBJECT
                            });
                        value = value.replace(color, "var(--".concat(colorVar.id, ")"));
                    }
                    newStyle[key] = value;
                }
            }
            if (newStyle) {
                node = __assign(__assign({}, node), { style: newStyle });
            }
        }
        if (node.children.length) {
            return __assign(__assign({}, node), { children: node.children.map(moveColorsToMap) });
        }
        return node;
    };
    root = moveColorsToMap(root);
    for (var color in colorVarMap) {
        var pcVar = colorVarMap[color];
        dest = (0, tandem_common_1.appendChildNode)(pcVar, dest);
    }
    return [root, dest];
};
exports.elevateColorsToGlobal = elevateColorsToGlobal;
var elevateTypographyToMixins = function (root, dest) {
    var _a;
    if (dest === void 0) { dest = root; }
    var typographyMixinMap = {};
    for (var _i = 0, _b = dest.children; _i < _b.length; _i++) {
        var child = _b[_i];
        if (child.name === dsl_1.PCSourceTagNames.STYLE_MIXIN &&
            child.targetType === dsl_1.PCSourceTagNames.TEXT) {
            var styleMixin = child;
            typographyMixinMap[JSON.stringify(styleMixin.style)] = styleMixin;
        }
    }
    var moveTypographyToMap = function (node) {
        var _a;
        if (node.name === dsl_1.PCSourceTagNames.ELEMENT ||
            node.name === dsl_1.PCSourceTagNames.TEXT) {
            var typographyStyle = {};
            var otherStyle = {};
            for (var key in node.style) {
                if (dsl_1.TEXT_STYLE_NAMES.indexOf(key) !== -1) {
                    typographyStyle[key] = node.style[key];
                }
                else {
                    otherStyle[key] = node.style[key];
                }
            }
            if (Object.keys(typographyStyle).length) {
                var key = JSON.stringify(typographyStyle);
                var mixin = typographyMixinMap[key] ||
                    (typographyMixinMap[key] = {
                        id: "via".concat(node.id),
                        name: dsl_1.PCSourceTagNames.STYLE_MIXIN,
                        targetType: dsl_1.PCSourceTagNames.TEXT,
                        style: typographyStyle,
                        value: "Text Style ".concat(Object.keys(typographyMixinMap).length + 1),
                        label: "Text Style ".concat(Object.keys(typographyMixinMap).length + 1),
                        children: tandem_common_1.EMPTY_ARRAY,
                        metadata: tandem_common_1.EMPTY_OBJECT
                    });
                node = __assign(__assign({}, node), { style: otherStyle, styleMixins: __assign(__assign({}, (node.styleMixins || tandem_common_1.EMPTY_OBJECT)), (_a = {}, _a[mixin.id] = {
                        priority: 1
                    }, _a)) });
            }
        }
        if (node.children.length) {
            return __assign(__assign({}, node), { children: node.children.map(moveTypographyToMap) });
        }
        return node;
    };
    root = moveTypographyToMap(root);
    var i = 0;
    for (var key in typographyMixinMap) {
        var mixin = typographyMixinMap[key];
        var size = 100;
        var left = i++ * (size + FRAME_PADDING);
        var top_1 = -(size + FRAME_PADDING);
        mixin = __assign(__assign({}, mixin), { metadata: __assign(__assign({}, mixin.metadata), (_a = {}, _a[dsl_1.PCVisibleNodeMetadataKey.BOUNDS] = {
                left: left,
                top: top_1,
                right: left + size,
                bottom: top_1 + size
            }, _a)) });
        dest = (0, tandem_common_1.appendChildNode)(mixin, dest);
    }
    return [root, dest];
};
exports.elevateTypographyToMixins = elevateTypographyToMixins;
var COLOR_REGEXP = new RegExp("(rgba?|hsla?)\\(.*?\\)|#[^\\s]+|".concat(Object.keys(dsl_1.CSS_COLOR_ALIASES).join("|")), "gi");
// TODO - need to get map of all css colors
var findCSSColors = function (value) {
    return String(value).match(COLOR_REGEXP) || tandem_common_1.EMPTY_ARRAY;
};
//# sourceMappingURL=utils.js.map

/***/ }),

/***/ "../paperclip/lib/vanilla-compiler.js":
/*!********************************************!*\
  !*** ../paperclip/lib/vanilla-compiler.js ***!
  \********************************************/
/***/ (function(__unused_webpack_module, exports, __webpack_require__) {

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
Object.defineProperty(exports, "__esModule", ({ value: true }));
exports.translateModuleToVanilla = exports.compileContentNodeAsVanilla = void 0;
var tandem_common_1 = __webpack_require__(/*! tandem-common */ "../common/index.js");
var dsl_1 = __webpack_require__(/*! ./dsl */ "../paperclip/lib/dsl.js");
var path = __webpack_require__(/*! path */ "../../node_modules/path-browserify/index.js");
var lodash_1 = __webpack_require__(/*! lodash */ "../../node_modules/lodash/lodash.js");
// Note: we're not using immutability here because this thing needs to be _fast_
var merge = function (a, b) {
    if (b == null)
        return a;
    if (!a || typeof b !== "object" || Array.isArray(b))
        return b;
    var clone = __assign({}, a);
    for (var k in b) {
        clone[k] = merge(a[k], b[k]);
    }
    return clone;
};
exports.compileContentNodeAsVanilla = (0, tandem_common_1.memoize)(function (node, refMap, varMap, queryMap, sourceUri, rootDirectory) {
    return new Function("generateUID", "merge", "return " +
        translateContentNode(node, refMap, varMap, queryMap, sourceUri, rootDirectory))(tandem_common_1.generateUID, merge);
});
exports.translateModuleToVanilla = (0, tandem_common_1.memoize)(function (module, componentRefMap, varMap, queryMap, sourceUri, rootDirectory) {
    return module.children
        .filter(function (child) {
        return child.name !== dsl_1.PCSourceTagNames.VARIABLE &&
            child.name !== dsl_1.PCSourceTagNames.QUERY;
    })
        .map(function (child) {
        return "exports._".concat(child.id, " = ").concat(translateContentNode(child, componentRefMap, varMap, queryMap, sourceUri, rootDirectory));
    })
        .join("\n");
});
var translateContentNode = (0, tandem_common_1.memoize)(function (node, componentRefMap, varMap, queryMap, sourceUri, rootDirectory) {
    var buffer = "(function() {";
    buffer += "var EMPTY_ARRAY = [];\n";
    buffer += "var EMPTY_OBJECT = {};\n";
    buffer += translateStaticNodeProps(node, componentRefMap, varMap, sourceUri, rootDirectory);
    buffer += translateStaticOverrides(node, varMap, sourceUri, rootDirectory);
    buffer += translateStaticVariants(node, varMap, sourceUri, rootDirectory);
    buffer += "return function(instanceSourceNodeId, instancePath, attributes, style, variant, overrides, windowInfo, components, isRoot) {\n      ".concat(translateVariants(node, queryMap, varMap), "\n      var childInstancePath = instancePath == null ? \"\" : (instancePath ? instancePath + \".\" : \"\") + instanceSourceNodeId;\n\n      // tiny optimization\n      if (style.display === \"none\" && !isRoot) {\n        return null;\n      }\n      return ").concat(translateVisibleNode(node, true), ";\n    }");
    return buffer + "})()";
});
var isBaseElement = function (node) {
    return node.name === dsl_1.PCSourceTagNames.ELEMENT ||
        node.name === dsl_1.PCSourceTagNames.COMPONENT ||
        node.name === dsl_1.PCSourceTagNames.COMPONENT_INSTANCE;
};
var translateVisibleNode = (0, tandem_common_1.memoize)(function (node, isContentNode) {
    if (isBaseElement(node)) {
        if ((0, dsl_1.extendsComponent)(node)) {
            return "components._".concat(node.is, "(").concat(isContentNode ? "instanceSourceNodeId" : "\"".concat(node.id, "\""), ", ").concat(isContentNode ? 'instancePath || ""' : "childInstancePath", ", ").concat(translateDynamicAttributes(node, isContentNode), ", ").concat(translateDynamicStyle(node, isContentNode), ", ").concat(translateDynamicVariant(node), ", ").concat(translateDynamicOverrides(node), ", windowInfo, components, ").concat(isContentNode ? "isRoot" : "false", ")");
        }
        return "{\n      id: generateUID(),\n      sourceNodeId: ".concat(isContentNode ? "instanceSourceNodeId" : "\"".concat(node.id, "\""), ",\n      instancePath: ").concat(isContentNode ? 'instancePath || ""' : "childInstancePath", ",\n      name: \"").concat(node.is, "\",\n      style: ").concat(translateDynamicStyle(node, isContentNode), ",\n      metadata: EMPTY_OBJECT,\n      attributes: ").concat(translateDynamicAttributes(node, isContentNode), ",\n      children: [").concat(node.children
            .map(translateElementChild)
            .filter(Boolean)
            .join(","), "].filter(Boolean)\n    }");
    }
    else if (node.name === dsl_1.PCSourceTagNames.TEXT) {
        return "{\n      id: generateUID(),\n      sourceNodeId: \"".concat(node.id, "\",\n      style: ").concat(translateDynamicStyle(node, isContentNode), ",\n      instancePath: childInstancePath,\n      metadata: EMPTY_OBJECT,\n      name: \"text\",\n      value: overrides._").concat(node.id, "Value || ").concat(JSON.stringify(node.value), ",\n      children: EMPTY_ARRAY\n    }");
    }
    else if (node.name === dsl_1.PCSourceTagNames.STYLE_MIXIN) {
        // note that element style mixins have children here since they _may_ be used to style "parts"
        // in the future.
        if (node.targetType === dsl_1.PCSourceTagNames.ELEMENT) {
            return "{\n          id: generateUID(),\n          sourceNodeId: \"".concat(node.id, "\",\n          style: ").concat(translateDynamicStyle(node, isContentNode), ",\n          instancePath: childInstancePath,\n          metadata: EMPTY_OBJECT,\n          name: \"element\",\n          attributes: EMPTY_OBJECT,\n          children: [").concat(node.children
                .map(translateElementChild)
                .filter(Boolean)
                .join(","), "].filter(Boolean)\n        }");
        }
        else if (node.targetType === dsl_1.PCSourceTagNames.TEXT) {
            return "{\n          id: generateUID(),\n          sourceNodeId: \"".concat(node.id, "\",\n          style: ").concat(translateDynamicStyle(node, isContentNode), ",\n          instancePath: childInstancePath,\n          metadata: EMPTY_OBJECT,\n          name: \"text\",\n          value: ").concat(JSON.stringify(node.value), ",\n          children: EMPTY_ARRAY\n        }");
        }
    }
});
var translateVariants = function (contentNode, queryMap, varMap) {
    var variants = (0, tandem_common_1.getTreeNodesByName)(dsl_1.PCSourceTagNames.VARIANT, contentNode)
        .concat()
        .reverse();
    var mediaTriggers = (0, tandem_common_1.getTreeNodesByName)(dsl_1.PCSourceTagNames.VARIANT_TRIGGER, contentNode).filter(function (trigger) {
        return trigger.source && trigger.source.type === dsl_1.PCVariantTriggerSourceType.QUERY;
    });
    var buffer = "";
    var _loop_1 = function (variant) {
        var variantTriggers = mediaTriggers.filter(function (trigger) { return trigger.targetVariantId === variant.id; });
        var queries = variantTriggers
            .map(function (trigger) {
            var query = queryMap[trigger.source.queryId];
            return query;
        })
            .filter(Boolean);
        var mediaQueries = queries.filter(function (query) { return query.type === dsl_1.PCQueryType.MEDIA && query.condition; });
        var variableQueries = queries.filter(function (query) { return query.type === dsl_1.PCQueryType.VARIABLE; });
        var useVariant = variableQueriesPassed(variableQueries, varMap);
        if (useVariant) {
            buffer += "if (instancePath != null || variant[\"".concat(variant.id, "\"]) {");
        }
        else {
            buffer += "if (variant[\"".concat(variant.id, "\"] ").concat(mediaQueries.length
                ? "|| (instancePath != null && " +
                    translateMediaCondition(mediaQueries) +
                    ")"
                : "", ") {");
        }
        buffer += "overrides = merge(_".concat(contentNode.id, "Variants._").concat(variant.id, ", overrides); ");
        buffer += "}\n";
    };
    for (var _i = 0, variants_1 = variants; _i < variants_1.length; _i++) {
        var variant = variants_1[_i];
        _loop_1(variant);
    }
    return buffer;
};
var translateMediaCondition = function (queries) {
    var conditions = [];
    for (var _i = 0, queries_1 = queries; _i < queries_1.length; _i++) {
        var media = queries_1[_i];
        var buffer = [];
        if (media.condition) {
            if (media.condition.minWidth) {
                buffer.push("windowInfo.width >= ".concat(Number(media.condition.minWidth)));
            }
            if (media.condition.maxWidth) {
                buffer.push("windowInfo.width <= ".concat(Number(media.condition.maxWidth)));
            }
        }
        if (!buffer.length) {
            buffer.push("true");
        }
        conditions.push("(".concat(buffer.join(" && "), ")"));
    }
    return "(" + conditions.join(" || ") + ")";
};
var variableQueriesPassed = function (queries, varMap) {
    return queries.some(function (query) {
        return (0, dsl_1.variableQueryPassed)(query, varMap);
    });
};
var translateElementChild = (0, tandem_common_1.memoize)(function (node) {
    if (node.name === dsl_1.PCSourceTagNames.SLOT) {
        return "...(overrides._".concat(node.id, "Children || [").concat(node.children
            .map(translateElementChild)
            .filter(Boolean)
            .join(","), "])");
    }
    else if ((0, dsl_1.isVisibleNode)(node)) {
        return translateVisibleNode(node);
    }
    else {
        // console.warn(`Cannot compile ${node.name}`);
    }
});
var translateDynamicAttributes = function (node, isContentNode) {
    if (isContentNode) {
        return "overrides._".concat(node.id, "Attributes ? Object.assign({}, _").concat(node.id, "Attributes, overrides._").concat(node.id, "Attributes, attributes) : Object.assign({}, _").concat(node.id, "Attributes, attributes)");
    }
    return "overrides._".concat(node.id, "Attributes ? Object.assign({}, _").concat(node.id, "Attributes, overrides._").concat(node.id, "Attributes) : _").concat(node.id, "Attributes");
};
var translateDynamicStyle = function (node, isContentNode) {
    if (isContentNode) {
        return "overrides._".concat(node.id, "Style ? Object.assign({}, _").concat(node.id, "Style, overrides._").concat(node.id, "Style, style) : Object.assign({}, _").concat(node.id, "Style, style)");
    }
    return "overrides._".concat(node.id, "Style ? Object.assign({},  _").concat(node.id, "Style, overrides._").concat(node.id, "Style) : _").concat(node.id, "Style");
};
var translateDynamicVariant = function (node) {
    return "overrides._".concat(node.id, "Variant ? Object.assign({},  _").concat(node.id, "Variant, overrides._").concat(node.id, "Variant) : _").concat(node.id, "Variant");
};
var translateDynamicOverrides = function (node) {
    var buffer = "merge(_".concat(node.id, "Overrides, merge(merge(overrides._").concat(node.id, "Overrides, overrides), {");
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var child = _a[_i];
        if (child.name === dsl_1.PCSourceTagNames.PLUG && child.children.length) {
            buffer += "_".concat(child.slotId, "Children: [").concat(child.children
                .map(translateElementChild)
                .filter(Boolean)
                .join(","), "].filter(Boolean),\n");
        }
    }
    return buffer + "}))";
};
var translateStaticOverrides = function (contentNode, varMap, sourceUri, rootDirectory) {
    var instances = __spreadArray(__spreadArray([], (0, tandem_common_1.getTreeNodesByName)(dsl_1.PCSourceTagNames.COMPONENT_INSTANCE, contentNode), true), (0, tandem_common_1.getTreeNodesByName)(dsl_1.PCSourceTagNames.COMPONENT, contentNode), true);
    var buffer = "";
    for (var _i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
        var instance = instances_1[_i];
        var overrideMap = (0, dsl_1.getOverrideMap)(instance, contentNode);
        buffer += "var _".concat(instance.id, "Overrides = { ").concat(translateVariantOverrideMap(overrideMap.default, varMap, sourceUri, rootDirectory), "};\n");
    }
    return buffer;
};
var translateStaticVariants = function (contentNode, varMap, sourceUri, rootDirectory) {
    var variants = (0, tandem_common_1.getTreeNodesByName)(dsl_1.PCSourceTagNames.VARIANT, contentNode);
    var variantNodes = (0, lodash_1.uniq)((0, tandem_common_1.getTreeNodesByName)(dsl_1.PCSourceTagNames.OVERRIDE, contentNode)
        .filter(function (override) {
        return (override.propertyName === dsl_1.PCOverridablePropertyName.STYLE ||
            override.propertyName ===
                dsl_1.PCOverridablePropertyName.VARIANT_IS_DEFAULT ||
            override.propertyName === dsl_1.PCOverridablePropertyName.VARIANT);
    })
        .map(function (override) {
        return (0, tandem_common_1.getParentTreeNode)(override.id, contentNode);
    }));
    var buffer = "_".concat(contentNode.id, "Variants = {");
    for (var _i = 0, variants_2 = variants; _i < variants_2.length; _i++) {
        var variant = variants_2[_i];
        buffer += "_".concat(variant.id, ": {");
        // we want to start with the _last_ items first, then work our way to the front
        // so that we have proper order of operations
        for (var i = variantNodes.length; i--;) {
            var node = variantNodes[i];
            var overrideMap = (0, dsl_1.getOverrideMap)(node, contentNode, node.name === dsl_1.PCSourceTagNames.COMPONENT_INSTANCE ||
                node.name === dsl_1.PCSourceTagNames.COMPONENT);
            if (!overrideMap[variant.id]) {
                continue;
            }
            buffer += "".concat(translateVariantOverrideMap(overrideMap[variant.id], varMap, sourceUri, rootDirectory));
        }
        buffer += "},";
    }
    return buffer + "};\n";
};
var mapStyles = function (style, sourceUri, rootDirectory) {
    var newStyle;
    for (var key in style) {
        var value = style[key];
        var newValue = value;
        if (typeof value === "string" &&
            (key === "background" || key === "background-image") &&
            /url\(.*?\)/.test(value) &&
            !/:\/\//.test(value)) {
            var uri = value.match(/url\(["']?(.*?)["']?\)/)[1];
            if (uri.charAt(0) === ".") {
                uri = "".concat(path.dirname(sourceUri), "/").concat(uri);
            }
            else {
                uri = "file://".concat((0, tandem_common_1.stripProtocol)(rootDirectory), "/").concat(uri);
            }
            newValue = value.replace(/url\(["']?(.*?)["']?\)/, "url(".concat(uri, ")"));
        }
        if (newValue !== value) {
            if (!newStyle)
                newStyle = __assign({}, style);
            newStyle[key] = newValue;
        }
    }
    return newStyle || style;
};
var translateVariantOverrideMap = (0, tandem_common_1.memoize)(function (map, varMap, sourceUri, rootDirectory) {
    var buffer = "";
    for (var nodeId in map) {
        var _a = map[nodeId], overrides = _a.overrides, childMap = _a.children;
        for (var _i = 0, overrides_1 = overrides; _i < overrides_1.length; _i++) {
            var override = overrides_1[_i];
            if (override.propertyName === dsl_1.PCOverridablePropertyName.STYLE) {
                buffer += "_".concat(nodeId, "Style: ").concat(JSON.stringify(mapStyles((0, dsl_1.computeStyleWithVars)(override.value, varMap), sourceUri, rootDirectory)), ",");
            }
            if (override.propertyName === dsl_1.PCOverridablePropertyName.ATTRIBUTES) {
                buffer += "_".concat(nodeId, "Attributes: ").concat(JSON.stringify(override.value), ",");
            }
            if (override.propertyName === dsl_1.PCOverridablePropertyName.VARIANT) {
                buffer += "_".concat(nodeId, "Variant: ").concat(JSON.stringify(override.value), ",");
            }
            if (override.propertyName === dsl_1.PCOverridablePropertyName.TEXT) {
                buffer += "_".concat(nodeId, "Value: ").concat(JSON.stringify(override.value), ",");
            }
        }
        buffer += "_".concat(nodeId, "Overrides: {");
        buffer += translateVariantOverrideMap(childMap, varMap, sourceUri, rootDirectory);
        buffer += "},";
    }
    return buffer + "";
});
var translateStaticNodeProps = (0, tandem_common_1.memoize)(function (node, componentRefMap, varMap, sourceUri, rootDirectory) {
    var buffer = "";
    if (isBaseElement(node)) {
        buffer += "var _".concat(node.id, "Attributes = {\n");
        for (var name_1 in node.attributes) {
            var value = node.attributes[name_1];
            if (node.is === "img" && !/\w+:\/\//.test(value)) {
                value = (0, tandem_common_1.addProtocol)(tandem_common_1.FILE_PROTOCOL, path.resolve(path.dirname((0, tandem_common_1.stripProtocol)(sourceUri)), value));
            }
            buffer += "\"".concat(name_1, "\": ").concat(JSON.stringify(value), ",\n");
        }
        buffer += "};\n";
    }
    if (isBaseElement(node) ||
        node.name === dsl_1.PCSourceTagNames.TEXT ||
        node.name === dsl_1.PCSourceTagNames.STYLE_MIXIN) {
        buffer += "var _".concat(node.id, "Style = ").concat(JSON.stringify(mapStyles((0, dsl_1.computePCNodeStyle)(node, componentRefMap, varMap), sourceUri, rootDirectory)), ";");
    }
    if (node.name === dsl_1.PCSourceTagNames.COMPONENT_INSTANCE ||
        node.name === dsl_1.PCSourceTagNames.COMPONENT) {
        buffer += "var _".concat(node.id, "Variant = ").concat(JSON.stringify(node.variant || tandem_common_1.EMPTY_OBJECT), ";");
    }
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var child = _a[_i];
        buffer += translateStaticNodeProps(child, componentRefMap, varMap, sourceUri, rootDirectory);
    }
    return buffer;
});
//# sourceMappingURL=vanilla-compiler.js.map

/***/ }),

/***/ "?3a9c":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?d4df":
/*!**********************!*\
  !*** util (ignored) ***!
  \**********************/
/***/ (() => {

/* (ignored) */

/***/ }),

/***/ "?3d43":
/*!********************!*\
  !*** fs (ignored) ***!
  \********************/
/***/ (() => {

/* (ignored) */

/***/ })

/******/ 	});
/************************************************************************/
/******/ 	// The module cache
/******/ 	var __webpack_module_cache__ = {};
/******/ 	
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/ 		// Check if module is in cache
/******/ 		var cachedModule = __webpack_module_cache__[moduleId];
/******/ 		if (cachedModule !== undefined) {
/******/ 			return cachedModule.exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = __webpack_module_cache__[moduleId] = {
/******/ 			id: moduleId,
/******/ 			loaded: false,
/******/ 			exports: {}
/******/ 		};
/******/ 	
/******/ 		// Execute the module function
/******/ 		__webpack_modules__[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/ 	
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/ 	
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/ 	
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = __webpack_modules__;
/******/ 	
/******/ 	// the startup function
/******/ 	__webpack_require__.x = () => {
/******/ 		// Load entry module and return exports
/******/ 		// This entry module depends on other loaded chunks and execution need to be delayed
/******/ 		var __webpack_exports__ = __webpack_require__.O(undefined, ["vendors-node_modules_crc32_lib_crc32_js-node_modules_lodash_lodash_js-node_modules_lru-cache_-e20a0c"], () => (__webpack_require__("./src/paperclip.worker.ts")))
/******/ 		__webpack_exports__ = __webpack_require__.O(__webpack_exports__);
/******/ 		return __webpack_exports__;
/******/ 	};
/******/ 	
/************************************************************************/
/******/ 	/* webpack/runtime/chunk loaded */
/******/ 	(() => {
/******/ 		var deferred = [];
/******/ 		__webpack_require__.O = (result, chunkIds, fn, priority) => {
/******/ 			if(chunkIds) {
/******/ 				priority = priority || 0;
/******/ 				for(var i = deferred.length; i > 0 && deferred[i - 1][2] > priority; i--) deferred[i] = deferred[i - 1];
/******/ 				deferred[i] = [chunkIds, fn, priority];
/******/ 				return;
/******/ 			}
/******/ 			var notFulfilled = Infinity;
/******/ 			for (var i = 0; i < deferred.length; i++) {
/******/ 				var [chunkIds, fn, priority] = deferred[i];
/******/ 				var fulfilled = true;
/******/ 				for (var j = 0; j < chunkIds.length; j++) {
/******/ 					if ((priority & 1 === 0 || notFulfilled >= priority) && Object.keys(__webpack_require__.O).every((key) => (__webpack_require__.O[key](chunkIds[j])))) {
/******/ 						chunkIds.splice(j--, 1);
/******/ 					} else {
/******/ 						fulfilled = false;
/******/ 						if(priority < notFulfilled) notFulfilled = priority;
/******/ 					}
/******/ 				}
/******/ 				if(fulfilled) {
/******/ 					deferred.splice(i--, 1)
/******/ 					var r = fn();
/******/ 					if (r !== undefined) result = r;
/******/ 				}
/******/ 			}
/******/ 			return result;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/compat get default export */
/******/ 	(() => {
/******/ 		// getDefaultExport function for compatibility with non-harmony modules
/******/ 		__webpack_require__.n = (module) => {
/******/ 			var getter = module && module.__esModule ?
/******/ 				() => (module['default']) :
/******/ 				() => (module);
/******/ 			__webpack_require__.d(getter, { a: getter });
/******/ 			return getter;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/define property getters */
/******/ 	(() => {
/******/ 		// define getter functions for harmony exports
/******/ 		__webpack_require__.d = (exports, definition) => {
/******/ 			for(var key in definition) {
/******/ 				if(__webpack_require__.o(definition, key) && !__webpack_require__.o(exports, key)) {
/******/ 					Object.defineProperty(exports, key, { enumerable: true, get: definition[key] });
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/ensure chunk */
/******/ 	(() => {
/******/ 		__webpack_require__.f = {};
/******/ 		// This file contains only the entry chunk.
/******/ 		// The chunk loading function for additional chunks
/******/ 		__webpack_require__.e = (chunkId) => {
/******/ 			return Promise.all(Object.keys(__webpack_require__.f).reduce((promises, key) => {
/******/ 				__webpack_require__.f[key](chunkId, promises);
/******/ 				return promises;
/******/ 			}, []));
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/get javascript chunk filename */
/******/ 	(() => {
/******/ 		// This function allow to reference async chunks and sibling chunks for the entrypoint
/******/ 		__webpack_require__.u = (chunkId) => {
/******/ 			// return url for filenames based on template
/******/ 			return "" + chunkId + ".bundle.js";
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/global */
/******/ 	(() => {
/******/ 		__webpack_require__.g = (function() {
/******/ 			if (typeof globalThis === 'object') return globalThis;
/******/ 			try {
/******/ 				return this || new Function('return this')();
/******/ 			} catch (e) {
/******/ 				if (typeof window === 'object') return window;
/******/ 			}
/******/ 		})();
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/hasOwnProperty shorthand */
/******/ 	(() => {
/******/ 		__webpack_require__.o = (obj, prop) => (Object.prototype.hasOwnProperty.call(obj, prop))
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/make namespace object */
/******/ 	(() => {
/******/ 		// define __esModule on exports
/******/ 		__webpack_require__.r = (exports) => {
/******/ 			if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 				Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 			}
/******/ 			Object.defineProperty(exports, '__esModule', { value: true });
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/node module decorator */
/******/ 	(() => {
/******/ 		__webpack_require__.nmd = (module) => {
/******/ 			module.paths = [];
/******/ 			if (!module.children) module.children = [];
/******/ 			return module;
/******/ 		};
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/publicPath */
/******/ 	(() => {
/******/ 		var scriptUrl;
/******/ 		if (__webpack_require__.g.importScripts) scriptUrl = __webpack_require__.g.location + "";
/******/ 		var document = __webpack_require__.g.document;
/******/ 		if (!scriptUrl && document) {
/******/ 			if (document.currentScript)
/******/ 				scriptUrl = document.currentScript.src
/******/ 			if (!scriptUrl) {
/******/ 				var scripts = document.getElementsByTagName("script");
/******/ 				if(scripts.length) scriptUrl = scripts[scripts.length - 1].src
/******/ 			}
/******/ 		}
/******/ 		// When supporting browsers where an automatic publicPath is not supported you must specify an output.publicPath manually via configuration
/******/ 		// or pass an empty string ("") and set the __webpack_public_path__ variable from your code to use your own logic.
/******/ 		if (!scriptUrl) throw new Error("Automatic publicPath is not supported in this browser");
/******/ 		scriptUrl = scriptUrl.replace(/#.*$/, "").replace(/\?.*$/, "").replace(/\/[^\/]+$/, "/");
/******/ 		__webpack_require__.p = scriptUrl;
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/importScripts chunk loading */
/******/ 	(() => {
/******/ 		// no baseURI
/******/ 		
/******/ 		// object to store loaded chunks
/******/ 		// "1" means "already loaded"
/******/ 		var installedChunks = {
/******/ 			"src_paperclip_worker_ts": 1
/******/ 		};
/******/ 		
/******/ 		// importScripts chunk loading
/******/ 		var installChunk = (data) => {
/******/ 			var [chunkIds, moreModules, runtime] = data;
/******/ 			for(var moduleId in moreModules) {
/******/ 				if(__webpack_require__.o(moreModules, moduleId)) {
/******/ 					__webpack_require__.m[moduleId] = moreModules[moduleId];
/******/ 				}
/******/ 			}
/******/ 			if(runtime) runtime(__webpack_require__);
/******/ 			while(chunkIds.length)
/******/ 				installedChunks[chunkIds.pop()] = 1;
/******/ 			parentChunkLoadingFunction(data);
/******/ 		};
/******/ 		__webpack_require__.f.i = (chunkId, promises) => {
/******/ 			// "1" is the signal for "already loaded"
/******/ 			if(!installedChunks[chunkId]) {
/******/ 				if(true) { // all chunks have JS
/******/ 					importScripts(__webpack_require__.p + __webpack_require__.u(chunkId));
/******/ 				}
/******/ 			}
/******/ 		};
/******/ 		
/******/ 		var chunkLoadingGlobal = self["webpackChunktandem_front_end"] = self["webpackChunktandem_front_end"] || [];
/******/ 		var parentChunkLoadingFunction = chunkLoadingGlobal.push.bind(chunkLoadingGlobal);
/******/ 		chunkLoadingGlobal.push = installChunk;
/******/ 		
/******/ 		// no HMR
/******/ 		
/******/ 		// no HMR manifest
/******/ 	})();
/******/ 	
/******/ 	/* webpack/runtime/startup chunk dependencies */
/******/ 	(() => {
/******/ 		var next = __webpack_require__.x;
/******/ 		__webpack_require__.x = () => {
/******/ 			return __webpack_require__.e("vendors-node_modules_crc32_lib_crc32_js-node_modules_lodash_lodash_js-node_modules_lru-cache_-e20a0c").then(next);
/******/ 		};
/******/ 	})();
/******/ 	
/************************************************************************/
/******/ 	
/******/ 	// run startup
/******/ 	var __webpack_exports__ = __webpack_require__.x();
/******/ 	
/******/ 	return __webpack_exports__;
/******/ })()
;
});