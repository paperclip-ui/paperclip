"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TMP_APP_BIN_PATH = exports.TMP_APP_DIR = exports.TMP_APP_ROOT_DIR = exports.DEFAULT_PROJECT_FILE_NAME = exports.PROJECT_FILE_EXTENSION = void 0;
var os_1 = require("os");
var distVersion = require("../package").distVersion;
var isWin = (0, os_1.platform)() === "win32";
exports.PROJECT_FILE_EXTENSION = "tdproject";
exports.DEFAULT_PROJECT_FILE_NAME = "app.".concat(exports.PROJECT_FILE_EXTENSION);
exports.TMP_APP_ROOT_DIR = "".concat((0, os_1.tmpdir)(), "/tandem");
exports.TMP_APP_DIR = "".concat((0, os_1.tmpdir)(), "/tandem/").concat(distVersion);
exports.TMP_APP_BIN_PATH = isWin
    ? "".concat(exports.TMP_APP_DIR, "/Tandem.").concat(isWin ? "exe" : "app").replace(/\//g, "\\")
    : "".concat(exports.TMP_APP_DIR, "/Tandem.").concat(isWin ? "exe" : "app");
//# sourceMappingURL=constants.js.map