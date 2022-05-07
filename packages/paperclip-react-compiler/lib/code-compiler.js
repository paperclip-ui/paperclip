"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translatePaperclipModuleToReact = exports.compilePaperclipModuleToReact = void 0;
var utils_1 = require("./utils");
var paperclip_virtual_dom_compiler_1 = require("paperclip-virtual-dom-compiler");
exports.compilePaperclipModuleToReact = function (entry, graph, rootDirectory) {
    var context = { exports: {} };
    new Function("exports", exports.translatePaperclipModuleToReact(entry, graph, rootDirectory).buffer)(context);
    return context.exports;
};
var getBaseRenderName = function (contentNode, context) {
    return "Base" + utils_1.getPublicComponentClassName(contentNode, context);
};
var getPublicRenderName = function (contentNode, context) {
    return "" + utils_1.getPublicComponentClassName(contentNode, context);
};
exports.translatePaperclipModuleToReact = paperclip_virtual_dom_compiler_1.createPaperclipVirtualDOMtranslator({
    elementCreator: "React.createElement",
    classAttributeName: "className"
}, {
    getControllerParameters: function (firstParam) { return [firstParam]; },
    getBaseRenderName: getBaseRenderName,
    getPublicRenderName: getPublicRenderName,
    translateModule: function (module, context, inner) {
        context = utils_1.addLine("var React = require('react');", context);
        context = inner(context);
        return context;
    },
    translateRenderer: function (contentNode, context, inner) {
        var publicClassName = getBaseRenderName(contentNode, context);
        context = utils_1.addOpenTag("var " + publicClassName + " = class extends React.PureComponent {\n", context);
        context = utils_1.addOpenTag("render() {\n", context);
        context = utils_1.addLine("var props = this.props;\n", context);
        context = inner(context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addCloseTag("}\n\n", context);
        return context;
    }
});
//# sourceMappingURL=code-compiler.js.map