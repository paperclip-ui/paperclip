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
exports.patchTreeNode = exports.diffTreeNode = exports.createSetNodePropertyOperationalTransform = exports.TreeNodeOperationalTransformType = void 0;
var tandem_common_1 = require("tandem-common");
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