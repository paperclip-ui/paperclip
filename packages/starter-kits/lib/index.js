"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __exportStar = (this && this.__exportStar) || function(m, exports) {
    for (var p in m) if (p !== "default" && !Object.prototype.hasOwnProperty.call(exports, p)) __createBinding(exports, m, p);
};
var _a, _b;
Object.defineProperty(exports, "__esModule", { value: true });
exports.createProjectFiles = exports.templates = void 0;
var react_1 = require("./react");
var blank_1 = require("./blank");
var templatesById = (_a = {},
    _a[react_1.template.id] = react_1.template,
    _a[blank_1.template.id] = blank_1.template,
    _a);
var fileCreatorsById = (_b = {},
    _b[react_1.template.id] = react_1.createFiles,
    // Note that this MUST go last since it doesn't have any additional setup. I.e: requires
    // a more technical user to handle.
    _b[blank_1.template.id] = blank_1.createFiles,
    _b);
exports.templates = Object.values(templatesById);
var createProjectFiles = function (templateId, options) {
    return fileCreatorsById[templateId](options);
};
exports.createProjectFiles = createProjectFiles;
__exportStar(require("./state"), exports);
//# sourceMappingURL=index.js.map