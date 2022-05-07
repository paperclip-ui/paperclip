"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.generateUID = exports.createUIDGenerator = void 0;
var crc32 = require("crc32");
// export type ChecksumGenerator<TObject> = (value: TObject) => string;
var createUIDGenerator = function (seed, index) {
    if (index === void 0) { index = 0; }
    return function () { return seed + index++; };
};
exports.createUIDGenerator = createUIDGenerator;
exports.generateUID = (0, exports.createUIDGenerator)(crc32(String("".concat(Date.now(), ".").concat(Math.random()))));
//# sourceMappingURL=uid.js.map