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
exports.rootReducer = void 0;
var actions_1 = require("../actions");
var tandem_common_1 = require("tandem-common");
exports.rootReducer = function (state, action) {
    switch (action.type) {
        case actions_1.TD_PROJECT_FILE_PICKED: {
            var filePath = action.filePath;
            return __assign(__assign({}, state), { tdProjectPath: tandem_common_1.normalizeFilePath(filePath) });
        }
        case actions_1.LOCAL_FILE_LOADED: {
            var path = action.path;
            if (/.tdproject/.test(path)) {
                return __assign(__assign({}, state), { tdProjectPath: tandem_common_1.normalizeFilePath(path) });
            }
            return state;
        }
        case actions_1.TD_PROJECT_LOADED: {
            var tdProject = action.project;
            return __assign(__assign({}, state), { tdProject: tdProject });
        }
        case actions_1.PREVIEW_SERVER_STARTED: {
            var port = action.port;
            return __assign(__assign({}, state), { info: __assign(__assign({}, state.info), { previewServer: {
                        port: port
                    } }) });
        }
    }
    return state;
};
//# sourceMappingURL=index.js.map