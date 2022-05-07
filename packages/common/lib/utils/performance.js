"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.pmark = void 0;
var pmark = function (label) {
    if (process.env.NODE_ENV !== "development") {
        return {
            end: function () { }
        };
    }
    performance.mark("start ".concat(label));
    return {
        end: function () {
            performance.mark("end ".concat(label));
            performance.measure("".concat(label), "start ".concat(label), "end ".concat(label));
        }
    };
};
exports.pmark = pmark;
//# sourceMappingURL=performance.js.map