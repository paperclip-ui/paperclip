"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.stringifyVirtualNode = exports.translatePaperclipModuleToHTMLRenderers = void 0;
// TODOS:
// - variants for props
// - variants for classes
// - tests**
var paperclip_1 = require("paperclip");
var utils_1 = require("./utils");
var paperclip_virtual_dom_compiler_1 = require("paperclip-virtual-dom-compiler");
var getPublicRenderName = function (contentNode, context) {
    return "render" + utils_1.getPublicComponentClassName(contentNode, context);
};
var getBaseRenderName = function (contentNode, context) {
    return getPublicRenderName(contentNode, context);
};
exports.translatePaperclipModuleToHTMLRenderers = paperclip_virtual_dom_compiler_1.createPaperclipVirtualDOMtranslator({
    elementCreator: "createElement",
    classAttributeName: "class"
}, {
    getControllerParameters: function (firstParam) { return [
        firstParam,
        "createElement"
    ]; },
    getBaseRenderName: getBaseRenderName,
    getPublicRenderName: getPublicRenderName,
    translateModule: function (module, context, inner) {
        context = paperclip_virtual_dom_compiler_1.addLine("var idCount = 0;", context);
        context = utils_1.addOpenTag("function flatten(ary) {\n", context);
        context = paperclip_virtual_dom_compiler_1.addLine("if (typeof ary !== \"object\") return [ary];", context);
        context = paperclip_virtual_dom_compiler_1.addLine("var flattened = [];", context);
        context = utils_1.addOpenTag("for (var i = 0, n = ary.length; i < n; i++) {\n", context);
        context = paperclip_virtual_dom_compiler_1.addLine("var item = ary[i];", context);
        context = utils_1.addOpenTag("if (Array.isArray(item)) {\n", context);
        context = paperclip_virtual_dom_compiler_1.addLine("flattened = flattened.concat(flattened, flatten(item));", context);
        context = utils_1.addCloseTag("}", context);
        context = utils_1.addOpenTag(" else {\n", context);
        context = paperclip_virtual_dom_compiler_1.addLine("flattened.push(item);", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addCloseTag("}\n", context);
        context = paperclip_virtual_dom_compiler_1.addLine("return flattened;", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addOpenTag("function createElement(tag, attributes, children) {\n", context);
        context = paperclip_virtual_dom_compiler_1.addLine("if (typeof tag === \"function\") return tag(Object.assign({}, attributes, { children: children }));", context);
        context = utils_1.addOpenTag("return {\n", context);
        context = paperclip_virtual_dom_compiler_1.addLine("id: \"node\" + (idCount++),", context);
        context = paperclip_virtual_dom_compiler_1.addLine("name: tag,", context);
        context = paperclip_virtual_dom_compiler_1.addLine("attributes: attributes || {},", context);
        context = paperclip_virtual_dom_compiler_1.addLine("children: flatten(children || []),", context);
        context = utils_1.addCloseTag("};\n", context);
        context = utils_1.addCloseTag("}\n", context);
        context = inner(context);
        return context;
    },
    translateRenderer: function (contentNode, context, inner) {
        var baseName = getBaseRenderName(contentNode, context);
        context = utils_1.addOpenTag("var " + baseName + " = function(props) {\n", context);
        context = inner(context);
        context = utils_1.addCloseTag("};\n", context);
        return context;
    }
});
exports.stringifyVirtualNode = function (node, indent, space) {
    if (indent === void 0) { indent = " "; }
    if (space === void 0) { space = ""; }
    if (typeof node === "string") {
        return space + node;
    }
    var buffer = space + ("<" + node.name);
    for (var key in node.attributes) {
        if (/^(children|key|text)$/.test(key)) {
            continue;
        }
        buffer += " " + key + "=\"" + node.attributes[key] + "\"";
    }
    buffer += ">";
    if (paperclip_1.isVoidTagName(node.name)) {
        return buffer;
    }
    buffer += "\n";
    for (var _i = 0, _a = node.children; _i < _a.length; _i++) {
        var child = _a[_i];
        buffer += exports.stringifyVirtualNode(child, indent, space + indent) + "\n";
    }
    buffer += space + ("</" + node.name + ">");
    return buffer;
};
paperclip_1.isVoidTagName;
//# sourceMappingURL=html-compiler.js.map