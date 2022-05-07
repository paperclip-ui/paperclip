"use strict";
var __assign = (this && this.__assign) || function () {
    __assign = Object.assign || function(t) {
        for (var s, i = 1, n = arguments.length; i < n; i++) {
            s = arguments[i];
            for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p))
                t[p] = s[p];
        }
        return t;
    };
    return __assign.apply(this, arguments);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.getFileCacheItemDataUrl = exports.updateFileCacheItem = exports.hasFileCacheItem = exports.getFileCacheItemsByMimetype = exports.fsCacheBusy = exports.queueSaveFile = exports.isSvgUri = exports.isImageUri = exports.getFSItem = exports.queueOpenFiles = exports.queueOpenFile = exports.FileCacheItemStatus = void 0;
var tandem_common_1 = require("tandem-common");
var mime = require("mime-types");
var FileCacheItemStatus;
(function (FileCacheItemStatus) {
    FileCacheItemStatus[FileCacheItemStatus["CREATED"] = 0] = "CREATED";
    FileCacheItemStatus[FileCacheItemStatus["LOADING"] = 1] = "LOADING";
    FileCacheItemStatus[FileCacheItemStatus["LOADED"] = 2] = "LOADED";
    FileCacheItemStatus[FileCacheItemStatus["SAVE_REQUESTED"] = 3] = "SAVE_REQUESTED";
    FileCacheItemStatus[FileCacheItemStatus["SAVING"] = 4] = "SAVING";
})(FileCacheItemStatus = exports.FileCacheItemStatus || (exports.FileCacheItemStatus = {}));
var queueOpenFile = function (uri, state) {
    var _a;
    // should always create new file for queueOpen since reducer
    // code may depend on newly loaded content
    return __assign(__assign({}, state), { fileCache: __assign(__assign({}, state.fileCache), (_a = {}, _a[uri] = createFileCacheItem(uri), _a)) });
};
exports.queueOpenFile = queueOpenFile;
var queueOpenFiles = function (uris, state) { return uris.reduce(function (state, uri) { return (0, exports.queueOpenFile)(uri, state); }, state); };
exports.queueOpenFiles = queueOpenFiles;
var getFSItem = function (uri, state) {
    return state.fileCache[uri];
};
exports.getFSItem = getFSItem;
var isImageUri = function (uri) {
    return /^image\//.test(mime.lookup(uri) || "");
};
exports.isImageUri = isImageUri;
var isSvgUri = function (uri) { return /\.svg$/.test(uri); };
exports.isSvgUri = isSvgUri;
var queueSaveFile = function (uri, state) {
    return (0, exports.updateFileCacheItem)({ status: FileCacheItemStatus.SAVE_REQUESTED }, uri, state);
};
exports.queueSaveFile = queueSaveFile;
exports.fsCacheBusy = (0, tandem_common_1.memoize)(function (fileCache) {
    return Object.values(fileCache).some(function (item) { return item.status !== FileCacheItemStatus.LOADED; });
});
var getFileCacheItemsByMimetype = function (mimeType, state) {
    var items = [];
    for (var uri in state) {
        var item = state[uri];
        if (item.mimeType === mimeType) {
            items.push(item);
        }
    }
    return items;
};
exports.getFileCacheItemsByMimetype = getFileCacheItemsByMimetype;
var hasFileCacheItem = function (uri, state) {
    return Boolean(state.fileCache[uri]);
};
exports.hasFileCacheItem = hasFileCacheItem;
var updateFileCacheItem = function (properties, uri, state) {
    var _a;
    return (__assign(__assign({}, state), { fileCache: __assign(__assign({}, state.fileCache), (_a = {}, _a[uri] = __assign(__assign(__assign({}, state.fileCache[uri]), properties), { dirty: state.fileCache[uri].dirty || Boolean(properties.content) }), _a)) }));
};
exports.updateFileCacheItem = updateFileCacheItem;
var createFileCacheItem = function (uri) { return ({
    uri: uri,
    status: FileCacheItemStatus.CREATED,
    content: null,
    mimeType: null
}); };
exports.getFileCacheItemDataUrl = (0, tandem_common_1.memoize)(function (_a) {
    var mimeType = _a.mimeType, content = _a.content;
    return "data:".concat(mimeType, ";base64, ").concat(content.toString("base64"));
});
//# sourceMappingURL=state.js.map