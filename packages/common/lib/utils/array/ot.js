"use strict";
var __extends = (this && this.__extends) || (function () {
    var extendStatics = function (d, b) {
        extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (Object.prototype.hasOwnProperty.call(b, p)) d[p] = b[p]; };
        return extendStatics(d, b);
    };
    return function (d, b) {
        if (typeof b !== "function" && b !== null)
            throw new TypeError("Class extends value " + String(b) + " is not a constructor or null");
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
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
exports.patchArray = exports.diffArray = exports.ArrayUpdateMutation = exports.ArrayDeleteMutation = exports.ArrayInsertMutation = exports.ArrayOperationalTransform = exports.ArrayOperationalTransformType = void 0;
var ArrayOperationalTransformType;
(function (ArrayOperationalTransformType) {
    ArrayOperationalTransformType.INSERT = "insert";
    ArrayOperationalTransformType.UPDATE = "update";
    ArrayOperationalTransformType.DELETE = "delete";
})(ArrayOperationalTransformType = exports.ArrayOperationalTransformType || (exports.ArrayOperationalTransformType = {}));
var ArrayOperationalTransform = /** @class */ (function () {
    function ArrayOperationalTransform(type) {
        this.type = type;
    }
    return ArrayOperationalTransform;
}());
exports.ArrayOperationalTransform = ArrayOperationalTransform;
var ArrayInsertMutation = /** @class */ (function (_super) {
    __extends(ArrayInsertMutation, _super);
    function ArrayInsertMutation(index, value) {
        var _this = _super.call(this, ArrayOperationalTransformType.INSERT) || this;
        _this.index = index;
        _this.value = value;
        return _this;
    }
    return ArrayInsertMutation;
}(ArrayOperationalTransform));
exports.ArrayInsertMutation = ArrayInsertMutation;
var ArrayDeleteMutation = /** @class */ (function (_super) {
    __extends(ArrayDeleteMutation, _super);
    function ArrayDeleteMutation(value, index) {
        var _this = _super.call(this, ArrayOperationalTransformType.DELETE) || this;
        _this.value = value;
        _this.index = index;
        return _this;
    }
    return ArrayDeleteMutation;
}(ArrayOperationalTransform));
exports.ArrayDeleteMutation = ArrayDeleteMutation;
var ArrayUpdateMutation = /** @class */ (function (_super) {
    __extends(ArrayUpdateMutation, _super);
    function ArrayUpdateMutation(originalOldIndex, patchedOldIndex, newValue, index) {
        var _this = _super.call(this, ArrayOperationalTransformType.UPDATE) || this;
        _this.originalOldIndex = originalOldIndex;
        _this.patchedOldIndex = patchedOldIndex;
        _this.newValue = newValue;
        _this.index = index;
        return _this;
    }
    return ArrayUpdateMutation;
}(ArrayOperationalTransform));
exports.ArrayUpdateMutation = ArrayUpdateMutation;
function diffArray(oldArray, newArray, countDiffs) {
    // model used to figure out the proper mutation indices
    var model = [].concat(oldArray);
    // remaining old values to be matched with new values. Remainders get deleted.
    var oldPool = [].concat(oldArray);
    // remaining new values. Remainders get inserted.
    var newPool = [].concat(newArray);
    var mutations = [];
    var matches = [];
    for (var i = 0, n = oldPool.length; i < n; i++) {
        var oldValue = oldPool[i];
        var bestNewValue = void 0;
        var fewestDiffCount = Infinity;
        // there may be multiple matches, so look for the best one
        for (var j = 0, n2 = newPool.length; j < n2; j++) {
            var newValue = newPool[j];
            // -1 = no match, 0 = no change, > 0 = num diffs
            var diffCount = countDiffs(oldValue, newValue);
            if (~diffCount && diffCount < fewestDiffCount) {
                bestNewValue = newValue;
                fewestDiffCount = diffCount;
            }
            // 0 = exact match, so break here.
            if (fewestDiffCount === 0)
                break;
        }
        // subtract matches from both old & new pools and store
        // them for later use
        if (bestNewValue != null) {
            oldPool.splice(i--, 1);
            n--;
            newPool.splice(newPool.indexOf(bestNewValue), 1);
            // need to manually set array indice here to ensure that the order
            // of operations is correct when mutating the target array.
            matches[newArray.indexOf(bestNewValue)] = [oldValue, bestNewValue];
        }
    }
    for (var i = oldPool.length; i--;) {
        var oldValue = oldPool[i];
        var index = oldArray.indexOf(oldValue);
        mutations.push(new ArrayDeleteMutation(oldValue, index));
        model.splice(index, 1);
    }
    // sneak the inserts into the matches so that they're
    // ordered propertly along with the updates - particularly moves.
    for (var i = 0, n = newPool.length; i < n; i++) {
        var newValue = newPool[i];
        var index = newArray.indexOf(newValue);
        matches[index] = [undefined, newValue];
    }
    // apply updates last using indicies from the old array model. This ensures
    // that mutations are properly applied to whatever target array.
    for (var i = 0, n = matches.length; i < n; i++) {
        var match = matches[i];
        // there will be empty values since we're manually setting indices on the array above
        if (match == null)
            continue;
        var _a = matches[i], oldValue = _a[0], newValue = _a[1];
        var newIndex = i;
        // insert
        if (oldValue == null) {
            mutations.push(new ArrayInsertMutation(newIndex, newValue));
            model.splice(newIndex, 0, newValue);
            // updated
        }
        else {
            var oldIndex = model.indexOf(oldValue);
            mutations.push(new ArrayUpdateMutation(oldArray.indexOf(oldValue), oldIndex, newValue, newIndex));
            if (oldIndex !== newIndex) {
                model.splice(oldIndex, 1);
                model.splice(newIndex, 0, oldValue);
            }
        }
    }
    return mutations;
}
exports.diffArray = diffArray;
function patchArray(target, ots, mapUpdate, mapInsert) {
    if (mapInsert === void 0) { mapInsert = function (b) { return b; }; }
    if (!ots.length) {
        return target;
    }
    var newTarget = __spreadArray([], target, true);
    for (var _i = 0, ots_1 = ots; _i < ots_1.length; _i++) {
        var ot = ots_1[_i];
        switch (ot.type) {
            case ArrayOperationalTransformType.INSERT: {
                var _a = ot, value = _a.value, index = _a.index;
                newTarget.splice(index, 0, mapInsert(value));
                break;
            }
            case ArrayOperationalTransformType.DELETE: {
                var index = ot.index;
                newTarget.splice(index, 1);
            }
            case ArrayOperationalTransformType.UPDATE: {
                var _b = ot, patchedOldIndex = _b.patchedOldIndex, newValue = _b.newValue, index = _b.index;
                var oldValue = target[patchedOldIndex];
                var patchedValue = mapUpdate(oldValue, newValue);
                if (patchedValue !== oldValue || patchedOldIndex !== index) {
                    if (patchedOldIndex !== index) {
                        newTarget.splice(patchedOldIndex, 1);
                    }
                    newTarget.splice(index, 0, patchedValue);
                }
            }
        }
    }
    return newTarget;
}
exports.patchArray = patchArray;
//# sourceMappingURL=ot.js.map