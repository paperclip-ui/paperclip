"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.findTDProjectFilePath = void 0;
var constants_1 = require("./constants");
var fs = require("fs");
var path = require("path");
var findTDProjectFilePath = function (cwd) {
    var result = fs
        .readdirSync(cwd)
        .find(function (filename) { return filename.split(".").indexOf(constants_1.PROJECT_FILE_EXTENSION) !== -1; });
    return result && path.join(cwd, result);
};
exports.findTDProjectFilePath = findTDProjectFilePath;
//# sourceMappingURL=utils.js.map