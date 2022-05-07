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
exports.patchDOM = exports.computeDisplayInfo = exports.waitForDOMReady = exports.renderDOM = void 0;
var lodash_1 = require("lodash");
var tandem_common_1 = require("tandem-common");
var ot_1 = require("./ot");
var dsl_1 = require("./dsl");
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