"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translatePaperclipModuleToReactTSDefinition = void 0;
var path = require("path");
var paperclip_1 = require("paperclip");
var utils_1 = require("./utils");
var tandem_common_1 = require("tandem-common");
var lodash_1 = require("lodash");
var paperclip_2 = require("paperclip");
exports.translatePaperclipModuleToReactTSDefinition = function (entry, graph) {
    return translateModule(entry.content, {
        options: {},
        entry: entry,
        buffer: "",
        graph: graph,
        definedObjects: {},
        scopedLabelRefs: {},
        depth: 0,
        warnings: []
    }).buffer;
};
var translateModule = function (module, context) {
    context = utils_1.addLine("import * as React from \"react\";", context);
    var components = module.children.filter(paperclip_1.isComponent);
    for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
        var component = components_1[_i];
        context = utils_1.setCurrentScope(module.id, context);
        context = utils_1.addScopedLayerLabel(component.label, component.id, context);
        if (component.controllers) {
            for (var _a = 0, _b = component.controllers; _a < _b.length; _a++) {
                var controllerPath = _b[_a];
                if (isTSFilePath(controllerPath)) {
                    var controllerClassName = getComponentControllerClassName(component, controllerPath, context);
                    context = utils_1.addLine("import " + controllerClassName + ", {Props as " + controllerClassName + "Props} from \"" + controllerPath.replace(/\.tsx?$/, "") + "\";", context);
                }
            }
        }
    }
    var imported = {};
    for (var _c = 0, _d = getLabeledNestedChildren(module); _c < _d.length; _c++) {
        var child = _d[_c];
        if (paperclip_1.isComponent(child) || paperclip_1.isPCComponentInstance(child)) {
            var current = child;
            while (1) {
                var dep = paperclip_1.getPCNodeDependency(current.id, context.graph);
                if (dep.uri !== context.entry.uri) {
                    if (!imported[dep.uri]) {
                        imported[dep.uri] = {};
                    }
                    imported[dep.uri][current.id] = 1;
                }
                if (!paperclip_1.extendsComponent(current)) {
                    break;
                }
                current = paperclip_1.getPCNode(current.is, context.graph);
            }
        }
    }
    for (var uri in imported) {
        var dep = context.graph[uri];
        var relPath = path
            .relative(path.dirname(tandem_common_1.stripProtocol(context.entry.uri)), tandem_common_1.stripProtocol(dep.uri))
            .replace(/\\/g, "/");
        if (relPath.charAt(0) !== ".") {
            relPath = "./" + relPath;
        }
        context = utils_1.addLine("import {" + Object.keys(imported[uri])
            .map(function (id) { return "_" + id + "Props"; })
            .join(", ") + "} from \"" + relPath + "\";", context);
    }
    context = utils_1.addOpenTag("\ntype TextProps = {\n", context);
    context = utils_1.addLine("text?: string;", context);
    context = utils_1.addCloseTag("} & React.HTMLAttributes<any>;\n\n", context);
    context = utils_1.addOpenTag("type ElementProps = {\n", context);
    context = utils_1.addLine("ref?: any;", context);
    context = utils_1.addCloseTag("} & React.HTMLAttributes<any>;\n\n", context);
    context = utils_1.setCurrentScope(module.id, context);
    for (var _e = 0, components_2 = components; _e < components_2.length; _e++) {
        var component = components_2[_e];
        context = translateComponent(component, context);
    }
    return context;
};
var translateComponent = function (component, context) {
    var componentClassName = utils_1.getPublicComponentClassName(component, context);
    var componentPropsName = getComponentPropsName(component, context);
    var controllerPath = (component.controllers || tandem_common_1.EMPTY_ARRAY).find(isTSFilePath);
    var labeledNestedChildren = getLabeledNestedChildren(component);
    // const labeledNestedChildren =
    context = utils_1.addOpenTag("export type Base" + getComponentPropsName(component, context) + " = {\n", context);
    context = utils_1.setCurrentScope(component.id, context);
    var variantNames = paperclip_1.getPCVariants(component)
        .map(function (variant) { return variant.label && utils_1.makeSafeVarName(lodash_1.camelCase(variant.label)); })
        .filter(Boolean);
    var slotNames = lodash_1.uniq(paperclip_1.getComponentSlots(component)
        .map(function (slot) { return slot.label && utils_1.makeSafeVarName(lodash_1.camelCase(slot.label)); })
        .filter(Boolean));
    if (variantNames.length) {
        context = utils_1.addLine("variant?: string;", context);
    }
    for (var _i = 0, slotNames_1 = slotNames; _i < slotNames_1.length; _i++) {
        var slotName = slotNames_1[_i];
        context = utils_1.addLine(slotName + "?: any;", context);
    }
    for (var _a = 0, labeledNestedChildren_1 = labeledNestedChildren; _a < labeledNestedChildren_1.length; _a++) {
        var child = labeledNestedChildren_1[_a];
        if (child.id === component.id)
            continue;
        if (child.name === paperclip_1.PCSourceTagNames.SLOT)
            continue;
        context = utils_1.addScopedLayerLabel(child.label + " Props", child.id, context);
        var childIsComponentInstance = paperclip_1.isPCComponentInstance(child);
        var hasController = childIsComponentInstance &&
            Boolean(paperclip_2.getInstanceExtends(child, context.graph).find(function (component) {
                return Boolean(component.controllers && component.controllers.length);
            }));
        // if a controller is attached, then require the parameter.
        context = utils_1.addLineItem("" + utils_1.getPublicLayerVarName(child.label + " Props", child.id, context) + (hasController ? "" : "?") + ": ", context);
        if (childIsComponentInstance) {
            context = utils_1.addLineItem("_" + child.is + "Props", context);
        }
        else {
            if (child.name === paperclip_1.PCSourceTagNames.TEXT) {
                context = utils_1.addLineItem("TextProps", context);
            }
            else {
                context = utils_1.addLineItem("ElementProps", context);
            }
        }
        context = utils_1.addLineItem(";\n", context);
    }
    context = utils_1.setCurrentScope(context.entry.content.id, context);
    context = utils_1.addCloseTag("}", context);
    var current = component;
    while (paperclip_1.extendsComponent(current)) {
        var parent_1 = paperclip_1.getPCNode(current.is, context.graph);
        context = utils_1.addLineItem(" & _" + parent_1.id + "Props", context);
        current = parent_1;
    }
    if (!paperclip_1.extendsComponent(component)) {
        context = utils_1.addLineItem(" & ElementProps", context);
    }
    context = utils_1.addLine(";\n", context);
    if (controllerPath) {
        var controllerClassName = getComponentControllerClassName(component, controllerPath, context);
        context = utils_1.addLine("export type _" + component.id + "Props = " + controllerClassName + "Props;", context);
        context = utils_1.addLine("export const " + componentClassName + ": (props: " + controllerClassName + "Props) => React.ReactElement<" + controllerClassName + "Props>;\n", context);
        return context;
    }
    context = utils_1.addLine("export type _" + component.id + "Props = Base" + componentPropsName + ";\n", context);
    context = utils_1.addLine("export const " + componentClassName + ": (props: Base" + componentPropsName + ") => React.ReactElement<Base" + componentPropsName + ">;\n", context);
    return context;
};
var getLabeledNestedChildren = function (parent) {
    return tandem_common_1.filterNestedNodes(parent, function (child) { return child.label; });
};
var getComponentPropsName = function (component, context) {
    return utils_1.getPublicComponentClassName(component, context) + "Props";
};
var isTSFilePath = function (filePath) { return /tsx?$/.test(filePath); };
var getComponentControllerClassName = function (component, controller, context) {
    var componentClassName = utils_1.getPublicComponentClassName(component, context);
    return componentClassName + "Controller" + component.controllers.indexOf(controller);
};
//# sourceMappingURL=dts-compiler.js.map