"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fileChanged = exports.fsSandboxItemSaved = exports.fsSandboxItemSaving = exports.fsSandboxItemLoading = exports.fsSandboxItemLoaded = exports.FileChangedEventType = exports.FILE_CHANGED = exports.FS_SANDBOX_ITEM_SAVING = exports.FS_SANDBOX_ITEM_SAVED = exports.FS_SANDBOX_ITEM_LOADED = exports.FS_SANDBOX_ITEM_LOADING = void 0;
exports.FS_SANDBOX_ITEM_LOADING = "FS_SANDBOX_ITEM_LOADING";
exports.FS_SANDBOX_ITEM_LOADED = "FS_SANDBOX_ITEM_LOADED";
exports.FS_SANDBOX_ITEM_SAVED = "FS_SANDBOX_ITEM_SAVED";
exports.FS_SANDBOX_ITEM_SAVING = "FS_SANDBOX_ITEM_SAVING";
exports.FILE_CHANGED = "FILE_CHANGED";
var FileChangedEventType;
(function (FileChangedEventType) {
    FileChangedEventType["UNLINK"] = "unlink";
    FileChangedEventType["ADD"] = "add";
    FileChangedEventType["UNLINK_DIR"] = "unlinkDir";
    FileChangedEventType["ADD_DIR"] = "addDir";
    FileChangedEventType["CHANGE"] = "change";
})(FileChangedEventType = exports.FileChangedEventType || (exports.FileChangedEventType = {}));
var fsSandboxItemLoaded = function (uri, content, mimeType) { return ({
    uri: uri,
    content: content,
    mimeType: mimeType,
    type: exports.FS_SANDBOX_ITEM_LOADED
}); };
exports.fsSandboxItemLoaded = fsSandboxItemLoaded;
var fsSandboxItemLoading = function (uri) { return ({
    uri: uri,
    type: exports.FS_SANDBOX_ITEM_LOADING
}); };
exports.fsSandboxItemLoading = fsSandboxItemLoading;
var fsSandboxItemSaving = function (uri) { return ({
    uri: uri,
    type: exports.FS_SANDBOX_ITEM_SAVING
}); };
exports.fsSandboxItemSaving = fsSandboxItemSaving;
var fsSandboxItemSaved = function (uri) { return ({
    uri: uri,
    type: exports.FS_SANDBOX_ITEM_SAVED
}); };
exports.fsSandboxItemSaved = fsSandboxItemSaved;
var fileChanged = function (eventType, uri) { return ({
    type: exports.FILE_CHANGED,
    eventType: eventType,
    uri: uri
}); };
exports.fileChanged = fileChanged;
//# sourceMappingURL=actions.js.map