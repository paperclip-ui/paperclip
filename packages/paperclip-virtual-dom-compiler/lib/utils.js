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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.addWarning = exports.makeSafeVarName = exports.getPublicLayerVarName = exports.getScopedLayerLabelIndex = exports.getInternalVarName = exports.addScopedLayerLabel = exports.setCurrentScope = exports.addCloseTag = exports.addOpenTag = exports.addLine = exports.addLineItem = exports.addBuffer = void 0;
var lodash_1 = require("lodash");
var tandem_common_1 = require("tandem-common");
var INDENT = "  ";
exports.addBuffer = function (buffer, context) {
    if (buffer === void 0) { buffer = ""; }
    return (__assign(__assign({}, context), { buffer: (context.buffer || "") + buffer }));
};
exports.addLineItem = function (buffer, context) {
    if (buffer === void 0) { buffer = ""; }
    return exports.addBuffer((context.newLine ? lodash_1.repeat(INDENT, context.depth) : "") + buffer, __assign(__assign({}, context), { newLine: buffer.lastIndexOf("\n") === buffer.length - 1 }));
};
exports.addLine = function (buffer, context) {
    if (buffer === void 0) { buffer = ""; }
    return exports.addLineItem(buffer + "\n", context);
};
exports.addOpenTag = function (buffer, context, indent) {
    if (indent === void 0) { indent = true; }
    return (__assign(__assign({}, exports.addLineItem(buffer, context)), { depth: indent ? context.depth + 1 : context.depth }));
};
exports.addCloseTag = function (buffer, context, indent) {
    if (indent === void 0) { indent = true; }
    return exports.addLineItem(buffer, __assign(__assign({}, context), { depth: indent ? context.depth - 1 : context.depth }));
};
exports.setCurrentScope = function (currentScope, context) { return (__assign(__assign({}, context), { currentScope: currentScope })); };
exports.addScopedLayerLabel = function (label, id, context) {
    var _a, _b, _c;
    label = String(label).toLowerCase();
    if (context.scopedLabelRefs[id]) {
        return context;
    }
    var scope = context.currentScope;
    if (!context.scopedLabelRefs[scope]) {
        context = __assign(__assign({}, context), { scopedLabelRefs: __assign(__assign({}, context.scopedLabelRefs), (_a = {}, _a[context.currentScope] = tandem_common_1.EMPTY_OBJECT, _a)) });
    }
    return __assign(__assign({}, context), { scopedLabelRefs: __assign(__assign({}, context.scopedLabelRefs), (_b = {}, _b[scope] = __assign(__assign({}, context.scopedLabelRefs[scope]), (_c = {}, _c[label] = lodash_1.uniq(__spreadArrays((context.scopedLabelRefs[scope][label] || tandem_common_1.EMPTY_ARRAY), [
            id
        ])), _c)), _b)) });
};
exports.getInternalVarName = function (node) { return "_" + node.id; };
exports.getScopedLayerLabelIndex = function (label, id, context) {
    return context.scopedLabelRefs[context.currentScope][String(label).toLowerCase()].indexOf(id);
};
exports.getPublicLayerVarName = function (label, id, context) {
    var i = exports.getScopedLayerLabelIndex(label, id, context);
    return exports.makeSafeVarName(lodash_1.camelCase(label || "child") + (i === 0 ? "" : i));
};
exports.makeSafeVarName = function (varName) {
    if (/^\d/.test(varName)) {
        varName = "$" + varName;
    }
    return varName;
};
exports.addWarning = function (warning, context) { return (__assign(__assign({}, context), { warnings: __spreadArrays(context.warnings, [warning]) })); };
//# sourceMappingURL=utils.js.map