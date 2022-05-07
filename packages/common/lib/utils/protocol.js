"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.FILE_PROTOCOL = exports.addProtocol = exports.stripProtocol = void 0;
var stripProtocol = function (uri) { return uri.replace(/^\w+:\/\//, ""); };
exports.stripProtocol = stripProtocol;
var addProtocol = function (protocol, uri) {
    return protocol + "//" + (0, exports.stripProtocol)(uri);
};
exports.addProtocol = addProtocol;
exports.FILE_PROTOCOL = "file:";
//# sourceMappingURL=protocol.js.map