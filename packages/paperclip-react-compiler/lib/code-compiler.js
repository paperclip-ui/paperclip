"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translatePaperclipModuleToReact = exports.compilePaperclipModuleToReact = void 0;
var utils_1 = require("./utils");
var paperclip_virtual_dom_compiler_1 = require("paperclip-virtual-dom-compiler");
var compilePaperclipModuleToReact = function (entry, graph, rootDirectory) {
    var context = { exports: {} };
    new Function("exports", (0, exports.translatePaperclipModuleToReact)(entry, graph, rootDirectory).buffer)(context);
    return context.exports;
};
exports.compilePaperclipModuleToReact = compilePaperclipModuleToReact;
var getBaseRenderName = function (contentNode, context) {
    return "Base".concat((0, utils_1.getPublicComponentClassName)(contentNode, context));
};
var getPublicRenderName = function (contentNode, context) {
    return "".concat((0, utils_1.getPublicComponentClassName)(contentNode, context));
};
exports.translatePaperclipModuleToReact = (0, paperclip_virtual_dom_compiler_1.createPaperclipVirtualDOMtranslator)({
    elementCreator: "React.createElement",
    classAttributeName: "className"
}, {
    getControllerParameters: function (firstParam) { return [firstParam]; },
    getBaseRenderName: getBaseRenderName,
    getPublicRenderName: getPublicRenderName,
    translateModule: function (module, context, inner) {
        context = (0, utils_1.addLine)("var React = require('react');", context);
        context = inner(context);
        return context;
    },
    translateRenderer: function (contentNode, context, inner) {
        var publicClassName = getBaseRenderName(contentNode, context);
        context = (0, utils_1.addOpenTag)("var ".concat(publicClassName, " = class extends React.PureComponent {\n"), context);
        context = (0, utils_1.addOpenTag)("render() {\n", context);
        context = (0, utils_1.addLine)("var props = this.props;\n", context);
        context = inner(context);
        context = (0, utils_1.addCloseTag)("}\n", context);
        context = (0, utils_1.addCloseTag)("}\n\n", context);
        return context;
    }
});
//# sourceMappingURL=code-compiler.js.map