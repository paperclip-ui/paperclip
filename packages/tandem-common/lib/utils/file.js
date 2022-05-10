"use strict";
var __spreadArray =
  (this && this.__spreadArray) ||
  function (to, from, pack) {
    if (pack || arguments.length === 2)
      for (var i = 0, l = from.length, ar; i < l; i++) {
        if (ar || !(i in from)) {
          if (!ar) ar = Array.prototype.slice.call(from, 0, i);
          ar[i] = from[i];
        }
      }
    return to.concat(ar || Array.prototype.slice.call(from));
  };
Object.defineProperty(exports, "__esModule", { value: true });
exports.normalizeFilePath = exports.resolveFilePath = void 0;
var resolveFilePath = function (relativePath, fromPath) {
  var pp1 = fromPath.split(/[\\/]/);
  var pp2 = relativePath.split(/[\\/]/);
  pp1.pop();
  if (pp2[0] === ".") {
    pp2.shift();
  } else {
    while (pp2[0] === "..") {
      pp2.shift();
      pp1.pop();
    }
  }
  return __spreadArray(__spreadArray([], pp1, true), pp2, true).join("/");
};
exports.resolveFilePath = resolveFilePath;
var normalizeFilePath = function (filePath) {
  return filePath.replace(/[\\]/g, "/").replace("C:/", "/");
};
exports.normalizeFilePath = normalizeFilePath;
//# sourceMappingURL=file.js.map
