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
exports.elevateTypographyToMixins = exports.elevateColorsToGlobal = exports.elevateCommonStylesToGlobal = exports.xmlToPCNode = void 0;
var xml = require("xml-js");
var dsl_1 = require("./dsl");
var tandem_common_1 = require("tandem-common");
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