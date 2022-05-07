"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.createFiles = exports.template = void 0;
var paperclip_1 = require("paperclip");
var tandem_common_1 = require("tandem-common");
exports.template = {
    id: "blank",
    icon: null,
    label: "Blank",
    description: "Blank project without libraries. Good if you want to setup the project on your own, or if you're looking to integrate Tandem into an existing application."
};
var createFiles = function (_a) {
    var _b;
    var mainComponent = (0, paperclip_1.createPCComponent)("Application", null, null, null, [(0, paperclip_1.createPCTextNode)("App content")], (_b = {},
        _b[paperclip_1.PCVisibleNodeMetadataKey.BOUNDS] = (0, tandem_common_1.createBounds)(0, 600, 0, 400),
        _b));
    return {
        "./src/main.pc": JSON.stringify((0, paperclip_1.createPCModule)([mainComponent]), null, 2)
    };
};
exports.createFiles = createFiles;
//# sourceMappingURL=index.js.map