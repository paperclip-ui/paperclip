"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyStyle = void 0;
var stringifyStyle = function (style) {
    var buffer = "";
    for (var name_1 in style) {
        if (style[name_1] == null)
            continue;
        buffer += "".concat(name_1, ":").concat(style[name_1], ";");
    }
    return buffer;
};
exports.stringifyStyle = stringifyStyle;
//# sourceMappingURL=html.js.map