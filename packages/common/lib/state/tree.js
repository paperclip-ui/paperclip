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
exports.addTreeNodeIds = exports.getParentTreeNode = exports.cloneTreeNode = exports.reduceTree = exports.dropChildNode = exports.insertChildNode = exports.appendChildNode = exports.updateNestedNodeTrail = exports.updateNestedNodeFromPath = exports.replaceNestedNode = exports.updateNestedNode = exports.removeNestedTreeNodeFromPath = exports.removeNestedTreeNode = exports.getRightMostTreeNode = exports.getTreeNodeUidGenerator = exports.generateTreeChecksum = exports.getTreeNodeHeight = exports.containsNestedTreeNodeById = exports.getNestedTreeNodeById = exports.getTreeNodeFromPath = exports.findNodeByTagName = exports.filterTreeNodeParents = exports.getTreeNodeAncestors = exports.findTreeNodeParent = exports.getTreeNodePath = exports.flattenTreeNode = exports.getTreeNodeIdMap = exports.getTreeNodesByName = exports.getNodeNameMap = exports.getChildParentMap = exports.filterNestedNodes = exports.createNodeNameMatcher = exports.createTreeNode = exports.findNestedNode = exports.TreeMoveOffset = void 0;
var memoization_1 = require("../utils/memoization");
var crc32 = require("crc32");
var array_1 = require("../utils/array");
var uid_1 = require("../utils/uid");
var uid_2 = require("../utils/uid");
var object_1 = require("../utils/object");
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