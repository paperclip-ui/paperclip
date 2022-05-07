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
exports.collapseInspectorNode = exports.getInspectorSyntheticNode = exports.getSyntheticInspectorNode = exports.getInspectorNodeParentShadow = exports.getInspectorInstanceShadowContentNode = exports.getInspectorInstanceShadow = exports.getInspectorContentNode = exports.getInspectorContentNodeContainingChild = exports.getInspectorNodeBySourceNodeId = exports.getSyntheticNodeInspectorNode = exports.getInspectorNodeOverrides = exports.getInheritedOverridesOverrides = exports.expandInspectorNodeById = exports.expandSyntheticInspectorNode = exports.expandInspectorNode = exports.inspectorNodeInInstanceOfComponent = exports.getInsertableInspectorNode = exports.getTopMostInspectorInstance = exports.getInspectorNodeOwnerInstance = exports.inspectorNodeInShadow = exports.getInstanceVariantInfo = exports.getInspectorSourceNode = exports.getInspectorNodeSyntheticDocument = exports.refreshInspectorTree = exports.isInspectorNode = exports.evaluateModuleInspector = exports.createRootInspectorNode = exports.InspectorTreeNodeName = void 0;
var dsl_1 = require("./dsl");
var lodash_1 = require("lodash");
var synthetic_1 = require("./synthetic");
var ot_1 = require("./ot");
var tandem_common_1 = require("tandem-common");
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