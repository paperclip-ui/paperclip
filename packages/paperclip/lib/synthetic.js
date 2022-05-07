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
exports.updateSyntheticVisibleNodeMetadata = exports.upsertSyntheticDocument = exports.isSyntheticNodeImmutable = exports.syntheticNodeIsInShadow = exports.getSyntheticDocumentsSourceMap = exports.getSyntheticSourceMap = exports.getSyntheticInstancePath = exports.getNearestComponentInstances = exports.isComponentOrInstance = exports.getAllParentComponentInstance = exports.findFurthestParentComponentInstance = exports.findClosestParentComponentInstance = exports.findInstanceOfPCNode = exports.getSyntheticNodeSourceDependency = exports.getSyntheticNodeById = exports.getSyntheticNode = exports.getSyntheticSourceUri = exports.getSyntheticVisibleNodeDocument = exports.getSyntheticDocumentDependencyUri = exports.getSyntheticContentNode = exports.getSyntheticDocumentByDependencyUri = exports.getSyntheticSourceFrame = exports.getSyntheticSourceNode = exports._getSyntheticNodeStyleColors = exports.getSyntheticNodeStyleColors = exports.getInheritedAndSelfOverrides = exports.isSyntheticVisibleNodeResizable = exports.isSyntheticVisibleNodeMovable = exports.isSyntheticVisibleNode = exports.isSyntheticTextNode = exports.isSyntheticElement = exports.isSyntheticDocument = exports.isSyntheticInstanceElement = exports.isSyntheticContentNode = exports.isSyntheticVisibleNodeRoot = exports.isPaperclipState = exports.createSytheticDocument = exports.SYNTHETIC_DOCUMENT_NODE_NAME = void 0;
var tandem_common_1 = require("tandem-common");
var lodash_1 = require("lodash");
var dsl_1 = require("./dsl");
var ot_1 = require("./ot");
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