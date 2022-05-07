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
exports.addWarning = exports.makeSafeVarName = exports.getPublicLayerVarName = exports.getScopedLayerLabelIndex = exports.getInternalVarName = exports.addScopedLayerLabel = exports.setCurrentScope = exports.addCloseTag = exports.addOpenTag = exports.addLine = exports.addLineItem = exports.addBuffer = void 0;
var lodash_1 = require("lodash");
var tandem_common_1 = require("tandem-common");
var INDENT = "  ";
var addBuffer = function (buffer, context) {
    if (buffer === void 0) { buffer = ""; }
    return (__assign(__assign({}, context), { buffer: (context.buffer || "") + buffer }));
};
exports.addBuffer = addBuffer;
var addLineItem = function (buffer, context) {
    if (buffer === void 0) { buffer = ""; }
    return (0, exports.addBuffer)((context.newLine ? (0, lodash_1.repeat)(INDENT, context.depth) : "") + buffer, __assign(__assign({}, context), { newLine: buffer.lastIndexOf("\n") === buffer.length - 1 }));
};
exports.addLineItem = addLineItem;
var addLine = function (buffer, context) {
    if (buffer === void 0) { buffer = ""; }
    return (0, exports.addLineItem)(buffer + "\n", context);
};
exports.addLine = addLine;
var addOpenTag = function (buffer, context, indent) {
    if (indent === void 0) { indent = true; }
    return (__assign(__assign({}, (0, exports.addLineItem)(buffer, context)), { depth: indent ? context.depth + 1 : context.depth }));
};
exports.addOpenTag = addOpenTag;
var addCloseTag = function (buffer, context, indent) {
    if (indent === void 0) { indent = true; }
    return (0, exports.addLineItem)(buffer, __assign(__assign({}, context), { depth: indent ? context.depth - 1 : context.depth }));
};
exports.addCloseTag = addCloseTag;
var setCurrentScope = function (currentScope, context) { return (__assign(__assign({}, context), { currentScope: currentScope })); };
exports.setCurrentScope = setCurrentScope;
var addScopedLayerLabel = function (label, id, context) {
    var _a, _b, _c;
    label = String(label).toLowerCase();
    if (context.scopedLabelRefs[id]) {
        return context;
    }
    var scope = context.currentScope;
    if (!context.scopedLabelRefs[scope]) {
        context = __assign(__assign({}, context), { scopedLabelRefs: __assign(__assign({}, context.scopedLabelRefs), (_a = {}, _a[context.currentScope] = tandem_common_1.EMPTY_OBJECT, _a)) });
    }
    return __assign(__assign({}, context), { scopedLabelRefs: __assign(__assign({}, context.scopedLabelRefs), (_b = {}, _b[scope] = __assign(__assign({}, context.scopedLabelRefs[scope]), (_c = {}, _c[label] = (0, lodash_1.uniq)(__spreadArray(__spreadArray([], (context.scopedLabelRefs[scope][label] || tandem_common_1.EMPTY_ARRAY), true), [
            id
        ], false)), _c)), _b)) });
};
exports.addScopedLayerLabel = addScopedLayerLabel;
var getInternalVarName = function (node) { return "_" + node.id; };
exports.getInternalVarName = getInternalVarName;
var getScopedLayerLabelIndex = function (label, id, context) {
    return context.scopedLabelRefs[context.currentScope][String(label).toLowerCase()].indexOf(id);
};
exports.getScopedLayerLabelIndex = getScopedLayerLabelIndex;
var getPublicLayerVarName = function (label, id, context) {
    var i = (0, exports.getScopedLayerLabelIndex)(label, id, context);
    return (0, exports.makeSafeVarName)((0, lodash_1.camelCase)(label || "child") + (i === 0 ? "" : i));
};
exports.getPublicLayerVarName = getPublicLayerVarName;
var makeSafeVarName = function (varName) {
    if (/^\d/.test(varName)) {
        varName = "$" + varName;
    }
    return varName;
};
exports.makeSafeVarName = makeSafeVarName;
var addWarning = function (warning, context) { return (__assign(__assign({}, context), { warnings: __spreadArray(__spreadArray([], context.warnings, true), [warning], false) })); };
exports.addWarning = addWarning;
//# sourceMappingURL=utils.js.map