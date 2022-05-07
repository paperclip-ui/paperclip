"use strict";
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
exports.arrayRemove = exports.arraySplice = void 0;
var arraySplice = function (target, index, count) {
    if (count === void 0) { count = 1; }
    var replacements = [];
    for (var _i = 3; _i < arguments.length; _i++) {
        replacements[_i - 3] = arguments[_i];
    }
    return __spreadArray(__spreadArray(__spreadArray([], target.slice(0, index), true), replacements, true), target.slice(index + count), true);
};
exports.arraySplice = arraySplice;
var arrayRemove = function (target, value) {
    var i = target.indexOf(value);
    return (0, exports.arraySplice)(target, i, 1);
};
exports.arrayRemove = arrayRemove;
//# sourceMappingURL=immutable.js.map