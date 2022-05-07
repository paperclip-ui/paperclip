"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.previewServerStarted = exports.tdProjectLoaded = exports.mainWindowOpened = exports.componentControllerPicked = exports.localFileOpened = exports.tdProjectFilePicked = exports.appReady = exports.directoryPathPicked = exports.imagePathPicked = exports.LOCAL_FILE_LOADED = exports.DIRECTORY_PATH_PICKED = exports.IMAGE_PATH_PICKED = exports.TD_PROJECT_FILE_PICKED = exports.NEW_PROJECT_MENU_ITEM_CLICKED = exports.OPEN_PROJECT_MENU_ITEM_CLICKED = exports.PREVIEW_SERVER_STARTED = exports.TD_PROJECT_LOADED = exports.MAIN_WINDOW_OPENED = exports.APP_READY = void 0;
var tandem_common_1 = require("tandem-common");
exports.APP_READY = "APP_READY";
exports.MAIN_WINDOW_OPENED = "MAIN_WINDOW_OPENED";
exports.TD_PROJECT_LOADED = "TD_PROJECT_LOADED";
exports.PREVIEW_SERVER_STARTED = "PREVIEW_SERVER_STARTED";
exports.OPEN_PROJECT_MENU_ITEM_CLICKED = "OPEN_PROJECT_MENU_ITEM_CLICKED";
exports.NEW_PROJECT_MENU_ITEM_CLICKED = "NEW_PROJECT_MENU_ITEM_CLICKED";
exports.TD_PROJECT_FILE_PICKED = "TD_PROJECT_FILE_PICKED";
exports.IMAGE_PATH_PICKED = "IMAGE_PATH_PICKED";
exports.DIRECTORY_PATH_PICKED = "DIRECTORY_PATH_PICKED";
exports.LOCAL_FILE_LOADED = "LOCAL_FILE_LOADED";
exports.imagePathPicked = tandem_common_1.publicActionCreator(function (filePath) { return ({
    filePath: filePath,
    type: exports.IMAGE_PATH_PICKED
}); });
exports.directoryPathPicked = tandem_common_1.publicActionCreator(function (directoryPath) { return ({
    directoryPath: directoryPath,
    type: exports.DIRECTORY_PATH_PICKED
}); });
exports.appReady = function () { return ({ type: exports.APP_READY }); };
exports.tdProjectFilePicked = function (filePath) { return ({
    filePath: filePath,
    type: exports.TD_PROJECT_FILE_PICKED
}); };
exports.localFileOpened = function (path) { return ({
    type: exports.LOCAL_FILE_LOADED,
    path: path
}); };
exports.componentControllerPicked = tandem_common_1.publicActionCreator(function (filePath) { return ({
    filePath: filePath,
    type: "COMPONENT_CONTROLLER_PICKED"
}); });
exports.mainWindowOpened = function () { return ({ type: exports.MAIN_WINDOW_OPENED }); };
exports.tdProjectLoaded = tandem_common_1.publicActionCreator(function (project, path) { return ({
    type: exports.TD_PROJECT_LOADED,
    project: project,
    path: path
}); });
exports.previewServerStarted = function (port) { return ({
    type: exports.PREVIEW_SERVER_STARTED,
    port: port
}); };
//# sourceMappingURL=index.js.map