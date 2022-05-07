"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.publicActionCreator = exports.isPublicAction = void 0;
var isPublicAction = function (action) { return action["@@public"] === true; };
exports.isPublicAction = isPublicAction;
var publicActionCreator = function (createAction) {
    return (function () {
        var args = [];
        for (var _i = 0; _i < arguments.length; _i++) {
            args[_i] = arguments[_i];
        }
        var action = createAction.apply(void 0, args);
        action["@@public"] = true;
        return action;
    });
};
exports.publicActionCreator = publicActionCreator;
//# sourceMappingURL=actions.js.map