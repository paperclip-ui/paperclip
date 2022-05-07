"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.translatePaperclipModuleToReactTSDefinition = void 0;
var path = require("path");
var paperclip_1 = require("paperclip");
var utils_1 = require("./utils");
var tandem_common_1 = require("tandem-common");
var lodash_1 = require("lodash");
var paperclip_2 = require("paperclip");
var translatePaperclipModuleToReactTSDefinition = function (entry, graph) {
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
exports.translatePaperclipModuleToReactTSDefinition = translatePaperclipModuleToReactTSDefinition;
var translateModule = function (module, context) {
    context = (0, utils_1.addLine)("import * as React from \"react\";", context);
    var components = module.children.filter(paperclip_1.isComponent);
    for (var _i = 0, components_1 = components; _i < components_1.length; _i++) {
        var component = components_1[_i];
        context = (0, utils_1.setCurrentScope)(module.id, context);
        context = (0, utils_1.addScopedLayerLabel)(component.label, component.id, context);
        if (component.controllers) {
            for (var _a = 0, _b = component.controllers; _a < _b.length; _a++) {
                var controllerPath = _b[_a];
                if (isTSFilePath(controllerPath)) {
                    var controllerClassName = getComponentControllerClassName(component, controllerPath, context);
                    context = (0, utils_1.addLine)("import ".concat(controllerClassName, ", {Props as ").concat(controllerClassName, "Props} from \"").concat(controllerPath.replace(/\.tsx?$/, ""), "\";"), context);
                }
            }
        }
    }
    var imported = {};
    for (var _c = 0, _d = getLabeledNestedChildren(module); _c < _d.length; _c++) {
        var child = _d[_c];
        if ((0, paperclip_1.isComponent)(child) || (0, paperclip_1.isPCComponentInstance)(child)) {
            var current = child;
            while (1) {
                var dep = (0, paperclip_1.getPCNodeDependency)(current.id, context.graph);
                if (dep.uri !== context.entry.uri) {
                    if (!imported[dep.uri]) {
                        imported[dep.uri] = {};
                    }
                    imported[dep.uri][current.id] = 1;
                }
                if (!(0, paperclip_1.extendsComponent)(current)) {
                    break;
                }
                current = (0, paperclip_1.getPCNode)(current.is, context.graph);
            }
        }
    }
    for (var uri in imported) {
        var dep = context.graph[uri];
        var relPath = path
            .relative(path.dirname((0, tandem_common_1.stripProtocol)(context.entry.uri)), (0, tandem_common_1.stripProtocol)(dep.uri))
            .replace(/\\/g, "/");
        if (relPath.charAt(0) !== ".") {
            relPath = "./" + relPath;
        }
        context = (0, utils_1.addLine)("import {".concat(Object.keys(imported[uri])
            .map(function (id) { return "_".concat(id, "Props"); })
            .join(", "), "} from \"").concat(relPath, "\";"), context);
    }
    context = (0, utils_1.addOpenTag)("\ntype TextProps = {\n", context);
    context = (0, utils_1.addLine)("text?: string;", context);
    context = (0, utils_1.addCloseTag)("} & React.HTMLAttributes<any>;\n\n", context);
    context = (0, utils_1.addOpenTag)("type ElementProps = {\n", context);
    context = (0, utils_1.addLine)("ref?: any;", context);
    context = (0, utils_1.addCloseTag)("} & React.HTMLAttributes<any>;\n\n", context);
    context = (0, utils_1.setCurrentScope)(module.id, context);
    for (var _e = 0, components_2 = components; _e < components_2.length; _e++) {
        var component = components_2[_e];
        context = translateComponent(component, context);
    }
    return context;
};
var translateComponent = function (component, context) {
    var componentClassName = (0, utils_1.getPublicComponentClassName)(component, context);
    var componentPropsName = getComponentPropsName(component, context);
    var controllerPath = (component.controllers || tandem_common_1.EMPTY_ARRAY).find(isTSFilePath);
    var labeledNestedChildren = getLabeledNestedChildren(component);
    // const labeledNestedChildren =
    context = (0, utils_1.addOpenTag)("export type Base".concat(getComponentPropsName(component, context), " = {\n"), context);
    context = (0, utils_1.setCurrentScope)(component.id, context);
    var variantNames = (0, paperclip_1.getPCVariants)(component)
        .map(function (variant) { return variant.label && (0, utils_1.makeSafeVarName)((0, lodash_1.camelCase)(variant.label)); })
        .filter(Boolean);
    var slotNames = (0, lodash_1.uniq)((0, paperclip_1.getComponentSlots)(component)
        .map(function (slot) { return slot.label && (0, utils_1.makeSafeVarName)((0, lodash_1.camelCase)(slot.label)); })
        .filter(Boolean));
    if (variantNames.length) {
        context = (0, utils_1.addLine)("variant?: string;", context);
    }
    for (var _i = 0, slotNames_1 = slotNames; _i < slotNames_1.length; _i++) {
        var slotName = slotNames_1[_i];
        context = (0, utils_1.addLine)("".concat(slotName, "?: any;"), context);
    }
    for (var _a = 0, labeledNestedChildren_1 = labeledNestedChildren; _a < labeledNestedChildren_1.length; _a++) {
        var child = labeledNestedChildren_1[_a];
        if (child.id === component.id)
            continue;
        if (child.name === paperclip_1.PCSourceTagNames.SLOT)
            continue;
        context = (0, utils_1.addScopedLayerLabel)("".concat(child.label, " Props"), child.id, context);
        var childIsComponentInstance = (0, paperclip_1.isPCComponentInstance)(child);
        var hasController = childIsComponentInstance &&
            Boolean((0, paperclip_2.getInstanceExtends)(child, context.graph).find(function (component) {
                return Boolean(component.controllers && component.controllers.length);
            }));
        // if a controller is attached, then require the parameter.
        context = (0, utils_1.addLineItem)("".concat((0, utils_1.getPublicLayerVarName)("".concat(child.label, " Props"), child.id, context)).concat(hasController ? "" : "?", ": "), context);
        if (childIsComponentInstance) {
            context = (0, utils_1.addLineItem)("_".concat(child.is, "Props"), context);
        }
        else {
            if (child.name === paperclip_1.PCSourceTagNames.TEXT) {
                context = (0, utils_1.addLineItem)("TextProps", context);
            }
            else {
                context = (0, utils_1.addLineItem)("ElementProps", context);
            }
        }
        context = (0, utils_1.addLineItem)(";\n", context);
    }
    context = (0, utils_1.setCurrentScope)(context.entry.content.id, context);
    context = (0, utils_1.addCloseTag)("}", context);
    var current = component;
    while ((0, paperclip_1.extendsComponent)(current)) {
        var parent_1 = (0, paperclip_1.getPCNode)(current.is, context.graph);
        context = (0, utils_1.addLineItem)(" & _".concat(parent_1.id, "Props"), context);
        current = parent_1;
    }
    if (!(0, paperclip_1.extendsComponent)(component)) {
        context = (0, utils_1.addLineItem)(" & ElementProps", context);
    }
    context = (0, utils_1.addLine)(";\n", context);
    if (controllerPath) {
        var controllerClassName = getComponentControllerClassName(component, controllerPath, context);
        context = (0, utils_1.addLine)("export type _".concat(component.id, "Props = ").concat(controllerClassName, "Props;"), context);
        context = (0, utils_1.addLine)("export const ".concat(componentClassName, ": (props: ").concat(controllerClassName, "Props) => React.ReactElement<").concat(controllerClassName, "Props>;\n"), context);
        return context;
    }
    context = (0, utils_1.addLine)("export type _".concat(component.id, "Props = Base").concat(componentPropsName, ";\n"), context);
    context = (0, utils_1.addLine)("export const ".concat(componentClassName, ": (props: Base").concat(componentPropsName, ") => React.ReactElement<Base").concat(componentPropsName, ">;\n"), context);
    return context;
};
var getLabeledNestedChildren = function (parent) {
    return (0, tandem_common_1.filterNestedNodes)(parent, function (child) { return child.label; });
};
var getComponentPropsName = function (component, context) {
    return "".concat((0, utils_1.getPublicComponentClassName)(component, context), "Props");
};
var isTSFilePath = function (filePath) { return /tsx?$/.test(filePath); };
var getComponentControllerClassName = function (component, controller, context) {
    var componentClassName = (0, utils_1.getPublicComponentClassName)(component, context);
    return "".concat(componentClassName, "Controller").concat(component.controllers.indexOf(controller));
};
//# sourceMappingURL=dts-compiler.js.map