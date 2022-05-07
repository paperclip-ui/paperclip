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
exports.persistUpdateVariable = exports.persistAddQuery = exports.persistAddVariable = exports.persistChangeElementType = exports.persistChangeSyntheticTextNodeValue = exports.persistAppendPCClips = exports.persistStyleMixinComponentId = exports.persistStyleMixin = exports.persistReplacePCNode = exports.persistRemoveVariantOverride = exports.persistUpdateVariantTrigger = exports.persistAddVariantTrigger = exports.persistToggleInstanceVariant = exports.persistUpdateVariant = exports.persistRemoveVariant = exports.persistAddVariant = exports.persistInsertNode = exports.syncSyntheticDocuments = exports.persistRemoveComponentController = exports.persistAddComponentController = exports.getEntireFrameBounds = exports.persistWrapInSlot = exports.persistConvertInspectorNodeStyleToMixin = exports.persistConvertNodeToComponent = exports.persistChangeLabel = exports.upsertFrames = exports.updateSyntheticVisibleNodeBounds = exports.updateSyntheticVisibleNodePosition = exports.updateFrameBounds = exports.updateFrame = exports.updateFramePosition = exports.updateSyntheticVisibleNode = exports.replaceSyntheticVisibleNode = exports.removeInspectorNode = exports.updateSyntheticDocument = exports.getSyntheticDocumentById = exports.removeFrame = exports.replaceDependency = exports.updateDependencyGraph = exports.updatePCEditorState = exports.getPCNodeClip = exports.getFrameSyntheticNode = exports.getSyntheticVisibleNodeRelativeBounds = exports.getFrameByContentNodeId = exports.getSyntheticVisibleNodeFrame = exports.getSyntheticVisibleNodeComputedBounds = exports.getFramesByDependencyUri = exports.getSyntheticDocumentFrames = exports.getFramesContentNodeIdMap = exports.DEFAULT_FRAME_BOUNDS = void 0;
exports.evaluateEditedStateSync = exports.persistRemovePCNode = exports.persistRemoveInspectorNode = exports.canRemovePCNode = exports.canremoveInspectorNode = exports.persistInspectorNodeStyle = exports.persistAttribute = exports.persistCSSProperties = exports.persistCSSProperty = exports.persistRawCSSText = exports.persistSyntheticNodeMetadata = exports.persistMoveSyntheticVisibleNode = exports.persistSyntheticVisibleNodeBounds = void 0;
var tandem_common_1 = require("tandem-common");
var lodash_1 = require("lodash");
var dsl_1 = require("./dsl");
var synthetic_1 = require("./synthetic");
var path = require("path");
var synthetic_layout_1 = require("./synthetic-layout");
var ot_1 = require("./ot");
var evaluate_1 = require("./evaluate");
var inspector_1 = require("./inspector");
var inspector_2 = require("./inspector");
var style_1 = require("./style");
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