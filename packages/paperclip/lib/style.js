"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.hasTextStyles = exports.getTextStyles = exports.filterTextStyles = exports.computeStyleInfo = void 0;
var tandem_common_1 = require("tandem-common");
var lodash_1 = require("lodash");
var inspector_1 = require("./inspector");
var dsl_1 = require("./dsl");
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