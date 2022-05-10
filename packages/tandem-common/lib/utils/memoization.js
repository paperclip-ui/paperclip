"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.underchange =
  exports.reuser =
  exports.shallowEquals =
  exports.memoize =
    void 0;
var lru = require("lru-cache");
var DEFAULT_LRU_MAX = 1000;
// need this for default arguments
var getArgumentCount = function (fn) {
  var str = fn.toString();
  var params = str.match(/\(.*?\)/)[0];
  var args = params
    .substr(1, params.length - 2)
    .split(/\s*,\s*/)
    .filter(function (arg) {
      return arg.substr(0, 3) !== "...";
    });
  return args.length;
};
var memoize = function (fn, lruMax, argumentCount) {
  if (lruMax === void 0) {
    lruMax = DEFAULT_LRU_MAX;
  }
  if (argumentCount === void 0) {
    argumentCount = getArgumentCount(fn);
  }
  if (argumentCount == Infinity || isNaN(argumentCount)) {
    throw new Error("Argument count cannot be Infinity, 0, or NaN.");
  }
  if (!argumentCount) {
    console.error("Argument count should not be 0. Defaulting to 1.");
    argumentCount = 1;
  }
  return compilFastMemoFn(argumentCount, lruMax > 0)(fn, lru({ max: lruMax }));
};
exports.memoize = memoize;
var shallowEquals = function (a, b) {
  var toa = typeof a;
  var tob = typeof b;
  if (toa !== tob) {
    return false;
  }
  if (toa !== "object" || !a || !b) {
    return a === b;
  }
  if (Object.keys(a).length !== Object.keys(b).length) {
    return false;
  }
  for (var key in a) {
    if (a[key] !== b[key]) {
      return false;
    }
  }
  return true;
};
exports.shallowEquals = shallowEquals;
var reuser = function (lruMax, getKey, equals) {
  if (lruMax === void 0) {
    lruMax = DEFAULT_LRU_MAX;
  }
  if (equals === void 0) {
    equals = exports.shallowEquals;
  }
  var cache = lru({ max: lruMax });
  return function (value) {
    var key = getKey(value);
    if (!cache.has(key) || !equals(cache.get(key), value)) {
      cache.set(key, value);
    }
    return cache.get(key);
  };
};
exports.reuser = reuser;
var _memoFns = {};
var compilFastMemoFn = function (argumentCount, acceptPrimitives) {
  var hash = "" + argumentCount + acceptPrimitives;
  if (_memoFns[hash]) {
    return _memoFns[hash];
  }
  var args = Array.from({ length: argumentCount }).map(function (v, i) {
    return "arg".concat(i);
  });
  var buffer =
    "\n  return function(fn, keyMemo) {\n    var memo = new WeakMap();\n    return function(".concat(
      args.join(", "),
      ") {\n      var currMemo = memo, prevMemo, key;\n  "
    );
  for (var i = 0, n = args.length - 1; i < n; i++) {
    var arg = args[i];
    buffer += "\n      prevMemo = currMemo;\n      key      = "
      .concat(arg, ";\n      ")
      .concat(
        acceptPrimitives
          ? 'if ((typeof key !== "object" || !key) && !(key = keyMemo.get('
              .concat(arg, "))) {\n        keyMemo.set(")
              .concat(arg, ", key = {});\n      }")
          : "",
        "\n      if (!(currMemo = currMemo.get(key))) {\n        prevMemo.set(key, currMemo = new WeakMap());\n      }\n    "
      );
  }
  var lastArg = args[args.length - 1];
  buffer += "\n      key = "
    .concat(lastArg, ";\n      ")
    .concat(
      acceptPrimitives
        ? '\n      if ((typeof key !== "object" || !key) && !(key = keyMemo.get('
            .concat(lastArg, "))) {\n        keyMemo.set(")
            .concat(lastArg, ", key = {});\n      }")
        : "",
      "\n\n      if (!currMemo.has(key)) {\n        currMemo.set(key, fn("
    )
    .concat(
      args.join(", "),
      "));\n      }\n\n      return currMemo.get(key);\n    };\n  };\n  "
    );
  return (_memoFns[hash] = new Function(buffer)());
};
/**
 * Calls target function once & proxies passed functions
 * @param fn
 */
var underchange = function (fn) {
  var currentArgs = [];
  var ret;
  var started;
  var start = function () {
    if (started) {
      return ret;
    }
    started = true;
    return (ret = fn.apply(
      void 0,
      currentArgs.map(function (a, i) {
        return function () {
          var args = [];
          for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
          }
          return currentArgs[i].apply(currentArgs, args);
        };
      })
    ));
  };
  return function () {
    var args = [];
    for (var _i = 0; _i < arguments.length; _i++) {
      args[_i] = arguments[_i];
    }
    currentArgs = args;
    return start();
  };
};
exports.underchange = underchange;
//# sourceMappingURL=memoization.js.map
