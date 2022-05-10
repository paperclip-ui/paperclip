"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyObject = exports.EMPTY_ARRAY = exports.EMPTY_OBJECT = void 0;
var memoization_1 = require("./memoization");
exports.EMPTY_OBJECT = {};
exports.EMPTY_ARRAY = [];
exports.stringifyObject = (0, memoization_1.memoize)(function (obj) {
  var tobj = typeof obj;
  if (Array.isArray(obj)) {
    return "[".concat(
      obj
        .map(function (v) {
          return (0, exports.stringifyObject)(v);
        })
        .join(","),
      "]"
    );
  } else if (tobj === "object") {
    if (obj) {
      var keys = Object.keys(obj);
      return "{".concat(
        keys
          .map(function (key) {
            return '"'
              .concat(key, '": ')
              .concat((0, exports.stringifyObject)(obj[key]));
          })
          .join(","),
        "}"
      );
    } else {
      return "null";
    }
  }
  return JSON.stringify(obj);
});
//# sourceMappingURL=object.js.map
