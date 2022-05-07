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
exports.translateModuleToVanilla = exports.compileContentNodeAsVanilla = void 0;
var tandem_common_1 = require("tandem-common");
var dsl_1 = require("./dsl");
var path = require("path");
var lodash_1 = require("lodash");
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