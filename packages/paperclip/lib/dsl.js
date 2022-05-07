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
exports.getGlobalVariables = exports.getPCNodeDependency = exports.getNativeComponentName = exports.getPCImportedChildrenSourceUris = exports.getPCVariantOverrides = exports.getPCVariants = exports.getOverrides = exports.getVisibleOrSlotChildren = exports.getVisibleChildren = exports.getModuleComponents = exports.isElementLikePCNode = exports.isTextLikePCNode = exports.extendsComponent = exports.isPCComponentOrInstance = exports.isPCComponentInstance = exports.isPCPlug = exports.isSlot = exports.isComponent = exports.isPCOverride = exports.isVisibleNode = exports.isValueOverride = exports.createPCDependency = exports.createPCOverride = exports.createPCPlug = exports.createPCSlot = exports.createPCTextNode = exports.createPCComponentInstance = exports.createPCElement = exports.createPCVariable = exports.createPCVariantTrigger = exports.createPCQuery = exports.createPCVariant = exports.createPCElementStyleMixin = exports.createPCTextStyleMixin = exports.getDerrivedPCLabel = exports.createPCComponent = exports.createPCModule = exports.PCElementState = exports.PCVariantTriggerSourceType = exports.PCVariableType = exports.PCQueryType = exports.COMPUTED_OVERRIDE_DEFAULT_KEY = exports.PCVisibleNodeMetadataKey = exports.CSS_COLOR_ALIASES = exports.INHERITABLE_STYLE_NAMES = exports.TEXT_STYLE_NAMES = exports.VOID_TAG_NAMES = exports.PCOverridablePropertyName = exports.PCSourceTagNames = exports.PAPERCLIP_MODULE_VERSION = void 0;
exports.replacePCNode = exports.flattenPCOverrideMap = exports.mergeVariantOverrides = exports.getOverrideMap = exports.filterNestedOverrides = exports.getNodeStyleRefIds = exports.computeStyleValue = exports.computeStyleWithVars = exports.getCSSVars = exports.styleValueContainsCSSVar = exports.getPCParentComponentInstances = exports.getVariableGraphRefs = exports.getQueryGraphRefs = exports.getAllVariableRefMap = exports.getQueryRefMap = exports.getVariableRefMap = exports.getComponentGraphRefMap = exports.pcNodeEquals = exports.getComponentGraphRefs = exports.computePCNodeStyle = exports.variableQueryPassed = exports.isVariantTriggered = exports.getSortedStyleMixinIds = exports.getComponentRefIds = exports.isVoidTagName = exports.getAllStyleMixins = exports.getAllPCComponents = exports.getNodeSourceComponent = exports.getDefaultVariantIds = exports.getComponentVariants = exports.getComponentTemplate = exports.updatePCNodeMetadata = exports.getPCNodeContentNode = exports.getPCNodeModule = exports.isPCContentNode = exports.filterPCNodes = exports.getPCNode = exports.getInstanceExtends = exports.getSlotPlug = exports.getInstanceShadow = exports.addPCNodePropertyBinding = exports.getInstanceSlotContent = exports.getVariantTriggers = exports.getComponentVariantTriggers = exports.getComponentSlots = exports.getInstanceSlots = exports.filterVariablesByType = exports.getGlobalMediaQueries = void 0;
var tandem_common_1 = require("tandem-common");
var lodash_1 = require("lodash");
var graph_1 = require("./graph");
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
exports.filterNestedOverrides = (0, tandem_common_1.memoize)(function (node) { return (0, tandem_common_1.filterNestedNodes)(node, exports.isPCOverride); });
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