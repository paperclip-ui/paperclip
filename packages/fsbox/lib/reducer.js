"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.fsSandboxReducer = void 0;
var state_1 = require("./state");
var actions_1 = require("./actions");
var fsSandboxReducer = function (state, action) {
    switch (action.type) {
        case actions_1.FS_SANDBOX_ITEM_LOADING: {
            var uri = action.uri;
            return (0, state_1.updateFileCacheItem)({ status: state_1.FileCacheItemStatus.LOADING }, uri, state);
        }
        case actions_1.FS_SANDBOX_ITEM_LOADED: {
            var _a = action, uri = _a.uri, content = _a.content, mimeType = _a.mimeType;
            return (0, state_1.updateFileCacheItem)({ status: state_1.FileCacheItemStatus.LOADED, content: content, mimeType: mimeType }, uri, state);
        }
        case actions_1.FS_SANDBOX_ITEM_SAVING: {
            var uri = action.uri;
            return (0, state_1.updateFileCacheItem)({ status: state_1.FileCacheItemStatus.SAVING }, uri, state);
        }
        case actions_1.FS_SANDBOX_ITEM_SAVED: {
            var uri = action.uri;
            return (0, state_1.updateFileCacheItem)({ status: state_1.FileCacheItemStatus.LOADED, dirty: false }, uri, state);
        }
    }
    return state;
};
exports.fsSandboxReducer = fsSandboxReducer;
//# sourceMappingURL=reducer.js.map