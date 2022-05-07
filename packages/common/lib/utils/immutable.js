"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.updateProperties = void 0;
var updateProperties = function (properties, target) {
    var newProps = {};
    var hasNewProps = false;
    for (var key in properties) {
        var newValue = properties[key];
        if (target[key] !== newValue) {
            newProps[key] = newValue;
            hasNewProps = true;
        }
    }
    if (!hasNewProps) {
        return target;
    }
    return Object.assign({}, target, properties);
};
exports.updateProperties = updateProperties;
//# sourceMappingURL=immutable.js.map