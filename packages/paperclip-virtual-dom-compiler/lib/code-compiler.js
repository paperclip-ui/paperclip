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
var __spreadArrays = (this && this.__spreadArrays) || function () {
    for (var s = 0, i = 0, il = arguments.length; i < il; i++) s += arguments[i].length;
    for (var r = Array(s), k = 0, i = 0; i < il; i++)
        for (var a = arguments[i], j = 0, jl = a.length; j < jl; j++, k++)
            r[k] = a[j];
    return r;
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createPaperclipVirtualDOMtranslator = void 0;
// TODOS:
// - variants for props
// - variants for classes
// - tests**
var paperclip_1 = require("paperclip");
var lodash_1 = require("lodash");
var tandem_common_1 = require("tandem-common");
var path = require("path");
var utils_1 = require("./utils");
var paperclip_2 = require("paperclip");
exports.createPaperclipVirtualDOMtranslator = function (parts, translators) {
    var translateModule = function (module, context) {
        context = translators.translateModule(module, context, function (context) {
            var imports = lodash_1.uniq(paperclip_1.getComponentRefIds(module)
                .map(function (refId) {
                return paperclip_1.getPCNodeDependency(refId, context.graph);
            })
                .filter(function (dep) { return dep && dep !== context.entry; }));
            if (imports.length) {
                context = utils_1.addLine("\nvar _imports = {};", context);
                for (var _i = 0, imports_1 = imports; _i < imports_1.length; _i++) {
                    var uri = imports_1[_i].uri;
                    // Change Windows OS path to Unix
                    var relativePath = path
                        .relative(path.dirname(tandem_common_1.stripProtocol(context.entry.uri)), tandem_common_1.stripProtocol(uri))
                        .replace(/\\/g, "/");
                    if (relativePath.charAt(0) !== ".") {
                        relativePath = "./" + relativePath;
                    }
                    context = utils_1.addLine("Object.assign(_imports, require(\"" + relativePath + "\"));", context);
                }
            }
            context = addToNativePropsFunction(context);
            context = addMergeFunction(context);
            context = addStylesToDocumentFunction(context);
            context = utils_1.addLine("\nvar _EMPTY_OBJECT = {}", context);
            context = utils_1.addLine("\nvar EMPTY_ARRAY = []", context);
            context = module.children
                .filter(paperclip_1.isComponent)
                .reduce(function (context, component) {
                return translateContentNode(component, module, context);
            }, context);
            if (context.options.compileNonComponents !== false) {
                context = module.children
                    .filter(lodash_1.negate(paperclip_1.isComponent))
                    .reduce(function (context, component) {
                    return translateContentNode(component, module, context);
                }, context);
            }
            return context;
        });
        return context;
    };
    var addToNativePropsFunction = function (context) {
        context = utils_1.addOpenTag("\nfunction _toNativeProps(props) {\n", context);
        context = utils_1.addLine("var newProps = {};", context);
        context = utils_1.addOpenTag("for (var key in props) {\n", context);
        context = utils_1.addLine("var value = props[key];", context);
        context = utils_1.addLine("var tov = typeof value;", context);
        context = utils_1.addOpenTag("if((tov !== \"object\" && key !== \"text\" && (tov !== \"function\" || key === \"ref\" || key.substr(0, 2) === \"on\")) || key === \"style\") {\n", context);
        context = utils_1.addLine("newProps[key] = value;", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addLine("return newProps;", context);
        context = utils_1.addCloseTag("}\n", context);
        return context;
    };
    var addMergeFunction = function (context) {
        context = utils_1.addOpenTag("\nfunction mergeProps(target, object, keyFilter) {\n", context);
        context = utils_1.addLine("if (object == null) return target; ", context);
        context = utils_1.addLine("if (!target || typeof object !== 'object' || Array.isArray(object)) return object; ", context);
        context = utils_1.addOpenTag("for (var key in object) {\n", context);
        context = utils_1.addOpenTag("if (!keyFilter || keyFilter(key, object)) {\n", context);
        context = utils_1.addLine("target[key] = key === \"" + parts.classAttributeName + "\" ? (target[key] ?  object[key] + \" \" + target[key] : object[key]) : mergeProps(target[key], object[key], keyFilter);", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addLine("return target;", context);
        context = utils_1.addCloseTag("}\n", context);
        return context;
    };
    var addStylesToDocumentFunction = function (context) {
        context = utils_1.addLine("// messy, but we need a way to skip selectors that have already been injected into the document", context);
        context = utils_1.addLine("var stringifiedStyles = typeof window !== \"undefined\" ? window.__stringifiedStyles || (window.__stringifiedStyles = {}) : {};", context);
        context = utils_1.addOpenTag("\nfunction stringifyStyleRulesInner(key, value) {\n", context);
        context = utils_1.addLine("if (typeof value === \"string\") return key + \":\" + value + \";\\n\"", context);
        context = utils_1.addLine("if (key.charAt(0) !== \"@\" && stringifiedStyles[key]) return \"\"", context);
        context = utils_1.addLine("stringifiedStyles[key] = true;", context);
        context = utils_1.addLine("return key + \"{\\n\" + stringifyStyleRules(value) + \"}\\n\"", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addOpenTag("\nfunction stringifyStyleRules(styleRules) {\n", context);
        context = utils_1.addLine("var buffer = [];", context);
        context = utils_1.addOpenTag("for (const key in styleRules) {\n", context);
        context = utils_1.addLine("buffer.push(stringifyStyleRulesInner(key, styleRules[key]));", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addLine("return buffer.join(\"\");", context);
        context = utils_1.addCloseTag("}\n", context);
        context = utils_1.addOpenTag("\nfunction addStylesToDocument(styleRules) {\n", context);
        context = utils_1.addLine("if (typeof document === \"undefined\") return;", context);
        context = utils_1.addLine("var cssText = stringifyStyleRules(styleRules);", context);
        context = utils_1.addLine("var style = document.createElement(\"style\");", context);
        context = utils_1.addLine("style.type = \"text/css\";", context);
        context = utils_1.addLine("style.textContent = cssText;", context);
        context = utils_1.addLine("document.head.appendChild(style);", context);
        context = utils_1.addCloseTag("}\n", context);
        return context;
    };
    var translateComponentStyles = function (component, context) {
        // basic styles
        context = translateComponentStyleInner(component, context);
        // variant styles
        context = utils_1.addLine("const styleVariantKey = (overrides.variantPrefixSelectors ? JSON.stringify(overrides.variantPrefixSelectors) : \"" + component.id + "\") + \"Style\";", context);
        context = translateStyleOverrides(component, context);
        return context;
    };
    var translateComponentStyleInner = function (component, context) {
        context = tandem_common_1.flattenTreeNode(component)
            .filter(function (node) {
            return paperclip_1.isVisibleNode(node) || node.name === paperclip_1.PCSourceTagNames.COMPONENT;
        })
            .reduce(function (context, node) {
            if (!hasStyle(node)) {
                return context;
            }
            context = utils_1.addOpenTag("mergeProps(styleRules, {\n", context);
            context = utils_1.addOpenTag("\"._" + node.id + "\": {\n", context);
            context = translateStyle(node, __assign(__assign({}, getInheritedStyle(node.styleMixins, context)), node.style), context, paperclip_1.getPCNodeDependency(node.id, context.graph).uri);
            context = utils_1.addCloseTag("}\n", context);
            context = utils_1.addCloseTag("});\n\n", context);
            return context;
        }, context);
        return context;
    };
    var isSVGPCNode = tandem_common_1.memoize(function (node, graph) {
        return (node &&
            (node.is === "svg" ||
                isSVGPCNode(tandem_common_1.getParentTreeNode(node.id, paperclip_1.getPCNodeModule(node.id, graph)), graph)));
    });
    var SVG_STYLE_PROP_MAP = {
        background: "fill"
    };
    var getInheritedStyle = function (styleMixins, context, computed) {
        if (computed === void 0) { computed = {}; }
        if (!styleMixins) {
            return {};
        }
        var styleMixinIds = Object.keys(styleMixins)
            .filter(function (a) { return Boolean(styleMixins[a]); })
            .sort(function (a, b) {
            return styleMixins[a].priority > styleMixins[b].priority ? 1 : -1;
        });
        return styleMixinIds.reduce(function (style, styleMixinId) {
            var styleMixin = paperclip_1.getPCNode(styleMixinId, context.graph);
            if (!styleMixin) {
                return style;
            }
            var compStyle = computed[styleMixinId] ||
                (computed[styleMixinId] = __assign(__assign({}, getInheritedStyle(styleMixin.styleMixins, context, computed)), styleMixin.style));
            return __assign(__assign({}, style), compStyle);
        }, {});
    };
    var stringifyValue = function (value) {
        var newValue = JSON.stringify(value);
        return newValue.substr(1, newValue.length - 2);
    };
    var translateStyle = function (target, style, context, sourceUri) {
        var isSVG = isSVGPCNode(target, context.graph);
        if (isSVG) {
            // TODO - add vendor prefix stuff here
            for (var key in style) {
                var propName = key;
                context = utils_1.addLine("\"" + (SVG_STYLE_PROP_MAP[propName] || propName) + "\": \"" + stringifyValue(translateStyleValue(key, style[key], context, sourceUri).replace(/[\n\r]/g, " ")) + "\",", context);
            }
        }
        else {
            // TODO - add vendor prefix stuff here
            for (var key in style) {
                context = utils_1.addLine("\"" + key + "\": \"" + translateStyleValue(key, style[key], context, sourceUri).replace(/[\n\r]/g, " ") + "\",", context);
            }
        }
        return context;
    };
    var translateStyleOverrides = function (contentNode, context) {
        var instances = tandem_common_1.filterNestedNodes(contentNode, function (node) {
            return node.name === paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE ||
                node.name === paperclip_1.PCSourceTagNames.COMPONENT;
        });
        for (var _i = 0, instances_1 = instances; _i < instances_1.length; _i++) {
            var instance = instances_1[_i];
            context = translateStyleVariantOverrides(instance, contentNode, context);
        }
        return context;
    };
    var translateStyleVariantOverrides = function (instance, component, context) {
        // FIXME: need to sort based on variant priority
        var styleOverrides = paperclip_1.getOverrides(instance).filter(function (node) {
            return node.propertyName === paperclip_1.PCOverridablePropertyName.STYLE &&
                Object.keys(node.value).length;
        }).sort(function (a, b) {
            return a.variantId ? 1 : -1;
        });
        var _loop_1 = function (override) {
            // console.log(instance.id, component.id, override.targetIdPath.length === 0 && instance.id === component.id);
            // override id is added as className to target element when imported. Necessary
            // to ensure that edge-cases like portals still maintain override values.
            var targetSelector = "._" + (override.targetIdPath.length === 0 && instance.id === component.id
                ? instance.id
                : override.id);
            var selector = targetSelector;
            var baseSelector = selector;
            // If an instance, then is a child of component and we should include in the scope
            // of the style override to ensure that we don't override other instances.
            // if (instance.name === PCSourceTagNames.COMPONENT_INSTANCE) {
            //   selector = `._${instance.id} ${selector}`;
            // }
            // if variant is defined, then it will be defined at the component level. Note that
            // we'll need to include combo variants here at some point. Also note that component ID isn't necessary
            // here since variant IDS are specific to components.
            var mediaTriggers = [];
            var variableTriggerPassed = void 0;
            if (override.variantId) {
                var variant = paperclip_1.getPCNode(override.variantId, context.graph);
                var variantTriggers = (variant && paperclip_1.getVariantTriggers(variant, component)) ||
                    tandem_common_1.EMPTY_ARRAY;
                var queryTriggers = variantTriggers.filter(function (trigger) {
                    return trigger.source &&
                        trigger.source.type === paperclip_1.PCVariantTriggerSourceType.QUERY;
                });
                variableTriggerPassed = queryTriggers.some(function (trigger) {
                    var query = paperclip_1.getPCNode(trigger.source.queryId, context.graph);
                    if (query && query.type == paperclip_2.PCQueryType.VARIABLE) {
                        return paperclip_1.variableQueryPassed(query, paperclip_1.getAllVariableRefMap(context.graph));
                    }
                    return false;
                });
                if (variableTriggerPassed) {
                    selector = "" + targetSelector;
                }
                else {
                    baseSelector = "\" + (overrides.variantPrefixSelectors && overrides.variantPrefixSelectors[\"" + override.variantId + "\"] && overrides.variantPrefixSelectors[\"" + override.variantId + "\"].map(prefix => prefix + \"" + targetSelector + "\").join(\", \") + \", \" || \"\") + \" ";
                    selector = baseSelector + " ._" + override.variantId + " " + targetSelector + ", ._" + override.variantId + targetSelector;
                }
                mediaTriggers = queryTriggers.filter(function (trigger) {
                    var query = paperclip_1.getPCNode(trigger.source.queryId, context.graph);
                    return query && query.type === paperclip_2.PCQueryType.MEDIA;
                });
                var variantTriggerSelectors = variantTriggers
                    .map(function (trigger) {
                    if (!trigger.source) {
                        return null;
                    }
                    if (trigger.source.type === paperclip_1.PCVariantTriggerSourceType.STATE) {
                        var prefix = "._" + component.id + ":" + trigger.source.state;
                        if (targetSelector !== "._" + component.id) {
                            return prefix + " " + targetSelector;
                        }
                        return prefix;
                    }
                })
                    .filter(Boolean);
                if (variantTriggerSelectors.length) {
                    selector += ", " + variantTriggerSelectors.join(", ");
                }
            }
            context = utils_1.addOpenTag("mergeProps(styleRules, {\n", context);
            context = utils_1.addOpenTag("[\"" + selector + "\"]: {\n", context);
            context = translateStyle(paperclip_1.getPCNode(lodash_1.last(override.targetIdPath), context.graph), override.value, context, paperclip_1.getPCNodeDependency(override.id, context.graph).uri);
            context = utils_1.addCloseTag("}\n", context);
            context = utils_1.addCloseTag("});\n\n", context);
            if (mediaTriggers.length && !variableTriggerPassed) {
                var mediaText = "@media all";
                mediaText += mediaTriggers
                    .map(function (trigger) {
                    var buffer = "";
                    var source = trigger.source;
                    var mediaQuery = paperclip_1.getPCNode(source.queryId, context.graph);
                    if (!mediaQuery) {
                        return null;
                    }
                    if (mediaQuery.condition && mediaQuery.condition.minWidth) {
                        buffer += " and (min-width: " + px(mediaQuery.condition.minWidth) + ")";
                    }
                    if (mediaQuery.condition && mediaQuery.condition.maxWidth) {
                        buffer += " and (max-width: " + px(mediaQuery.condition.maxWidth) + ")";
                    }
                    return buffer;
                })
                    .filter(Boolean)
                    .join(", ");
                context = utils_1.addOpenTag("mergeProps(styleRules, {\n", context);
                context = utils_1.addOpenTag("[\"" + mediaText + "\"]: {\n", context);
                context = utils_1.addOpenTag("[\"" + baseSelector + " " + targetSelector + "\"]: {\n", context);
                context = translateStyle(paperclip_1.getPCNode(lodash_1.last(override.targetIdPath), context.graph), override.value, context, paperclip_1.getPCNodeDependency(override.id, context.graph).uri);
                context = utils_1.addCloseTag("}\n", context);
                context = utils_1.addCloseTag("}\n", context);
                context = utils_1.addCloseTag("});\n\n", context);
            }
        };
        for (var _i = 0, styleOverrides_1 = styleOverrides; _i < styleOverrides_1.length; _i++) {
            var override = styleOverrides_1[_i];
            _loop_1(override);
        }
        return context;
    };
    var px = function (value) {
        if (!isNaN(Number(value))) {
            return value + "px";
        }
        return value;
    };
    var translateStyleValue = function (key, value, _a, sourceUri) {
        var graph = _a.graph, rootDirectory = _a.rootDirectory;
        value = paperclip_1.computeStyleValue(value, paperclip_1.getAllVariableRefMap(graph));
        if (typeof value === "number" && key !== "opacity") {
            return value + "px";
        }
        if (typeof value === "string") {
            if (/url\(.*?\)/.test(value) && !/https?:\/\//.test(value)) {
                var uri = value.match(/url\(["']?(.*?)["']?\)/)[1];
                if (uri.charAt(0) === ".") {
                    uri = path.dirname(sourceUri) + "/" + uri;
                }
                else {
                    uri = "file://" + tandem_common_1.stripProtocol(rootDirectory) + "/" + uri;
                }
                value = value.replace(/url\(["']?(.*?)["']?\)/, "url(" + uri + ")");
                // strip file if it exists.
                // value = value.replace("file://", "");
                // value = value.replace(
                //   /url\(["']?(.*?)["']?\)/,
                //   `url(" + require("$1") + ")`
                // );
            }
            else {
                value = stringifyValue(value);
            }
        }
        return String(value);
    };
    var translateContentNode = function (contentNode, module, context) {
        context = utils_1.setCurrentScope(module.id, context);
        context = utils_1.addScopedLayerLabel(contentNode.label, contentNode.id, context);
        var internalVarName = utils_1.getInternalVarName(contentNode);
        context = utils_1.addOpenTag("\nfunction " + internalVarName + "(overrides) {\n", context);
        context = utils_1.addLine("var styleRules = {};", context);
        context = translatedUsedComponentInstances(contentNode, context);
        context = translateStaticOverrides(contentNode, context);
        if (context.options.includeCSS !== false) {
            context = translateComponentStyles(contentNode, context);
        }
        var variantLabelMap = getVariantLabelMap(contentNode);
        context = utils_1.addOpenTag("const VARIANT_LABEL_ID_MAP = {\n", context);
        for (var id in variantLabelMap) {
            context = utils_1.addLine("\"" + variantLabelMap[id][0] + "\": \"" + id + "\",", context);
        }
        context = utils_1.addCloseTag("};\n", context);
        context = utils_1.addLine("var _variantMapCache = {};\n", context);
        context = utils_1.addOpenTag("var getVariantMap = function(variant) {\n", context);
        context = utils_1.addLine("return _variantMapCache[variant] || (_variantMapCache[variant] = variant.split(\" \").map(function(label) { return VARIANT_LABEL_ID_MAP[label.trim()] || label.trim(); }));", context);
        context = utils_1.addCloseTag("};\n\n", context);
        var baseRenderName = translators.getBaseRenderName(contentNode, context);
        var publicRenderName = translators.getPublicRenderName(contentNode, context);
        context = translators.translateRenderer(contentNode, context, function (context) {
            if (paperclip_1.isPCComponentOrInstance(contentNode) &&
                !paperclip_1.extendsComponent(contentNode)) {
                context = utils_1.addLineItem("var _" + contentNode.id + "Props = Object.assign({}, _" + contentNode.id + "StaticProps, props);\n", context);
                context = addClassNameCheck("" + contentNode.id, "props", context);
            }
            else {
                context = utils_1.addLine("var _" + contentNode.id + "Props = Object.assign({}, overrides, props);", context);
            }
            context = utils_1.addLine("var variant = props.variant != null ? getVariantMap(props.variant) : EMPTY_ARRAY;", context);
            context = utils_1.setCurrentScope(contentNode.id, context);
            context = defineNestedObject(["_" + contentNode.id + "Props"], false, context);
            context = tandem_common_1.flattenTreeNode(contentNode)
                .filter(function (node) { return paperclip_1.isVisibleNode(node); })
                .reduce(function (context, node) {
                if (node === contentNode)
                    return context;
                context = utils_1.addScopedLayerLabel(node.label + " Props", node.id, context);
                var propsVarName = getNodePropsVarName(node, context);
                context = defineNestedObject(["_" + node.id + "Props"], false, context);
                // context = addLineItem(`var _${node.id}Props = (_${contentNode.id}Props.${propsVarName} || _${contentNode.id}Props._${node.id}) && `, context);
                context = utils_1.addLine("var _" + node.id + "Props = Object.assign({}, _" + node.id + "StaticProps, _" + contentNode.id + "Props._" + node.id + ", _" + contentNode.id + "Props." + propsVarName + ");", context);
                if (node.name !== paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE) {
                    context = addClassNameCheck(node.id, "_" + node.id + "Props", context);
                }
                // context = addLine(
                //   `_${node.id}Props = Object.assign({}, _${node.id}StaticProps, _${
                //     node.id
                //   }Props);`,
                //   context
                // );
                return context;
            }, context);
            context = utils_1.addLine("", context);
            // variants need to come first since there may be child overrides that have variant styles
            context = translateDynamicOverrideKeys(contentNode, context);
            context = translateContentNodeVariantOverrides(contentNode, context);
            context = translateContentNodeOverrides(contentNode, context);
            context = utils_1.addLine("", context);
            context = utils_1.addLineItem("return ", context);
            if (contentNode.name === paperclip_1.PCSourceTagNames.TEXT) {
                context = utils_1.addOpenTag(parts.elementCreator + "('span', null, ", context);
                context = translateVisibleNode(contentNode, context);
                context = utils_1.addCloseTag(");", context);
            }
            else {
                context = translateElement(contentNode, context);
            }
            context = utils_1.addLine(";", context);
            return context;
        });
        if (paperclip_1.isComponent(contentNode)) {
            context = translateControllers(baseRenderName, contentNode, context);
        }
        context = utils_1.addLine("return { renderer: " + baseRenderName + ", styleRules: styleRules };", context);
        context = utils_1.addCloseTag("};\n", context);
        // necessary or other imported modules
        context = utils_1.addLine("\nexports." + internalVarName + " = " + internalVarName + ";", context);
        context = utils_1.addLine("var " + publicRenderName + "Imp = " + internalVarName + "({});", context);
        context = utils_1.addLine("exports." + publicRenderName + " = " + publicRenderName + "Imp.renderer;", context);
        context = utils_1.addLine("addStylesToDocument(" + publicRenderName + "Imp.styleRules);", context);
        return context;
    };
    var getVariantLabelMap = function (contentNode) {
        var map = {};
        var variants = paperclip_1.getPCVariants(contentNode);
        for (var _i = 0, variants_1 = variants; _i < variants_1.length; _i++) {
            var variant = variants_1[_i];
            map[variant.id] = [
                utils_1.makeSafeVarName(lodash_1.camelCase(variant.label)),
                variant.isDefault
            ];
        }
        return map;
    };
    var addClassNameCheck = function (id, varName, context) {
        context = utils_1.addOpenTag("if(" + varName + "." + parts.classAttributeName + " !== _" + id + "StaticProps." + parts.classAttributeName + ") {\n", context);
        context = utils_1.addLine("_" + id + "Props." + parts.classAttributeName + " = _" + id + "StaticProps." + parts.classAttributeName + " + (" + varName + "." + parts.classAttributeName + " ? \" \" + " + varName + "." + parts.classAttributeName + " : \"\");", context);
        context = utils_1.addCloseTag("}\n\n", context);
        return context;
    };
    var translatedUsedComponentInstances = function (component, context) {
        var componentInstances = tandem_common_1.filterNestedNodes(component, paperclip_1.isPCComponentInstance);
        // dirty 🙈
        var usedComponent = false;
        if (paperclip_1.isPCComponentOrInstance(component) && paperclip_1.extendsComponent(component)) {
            usedComponent = true;
            context = translateUsedComponentInstance(component, context);
        }
        for (var _i = 0, componentInstances_1 = componentInstances; _i < componentInstances_1.length; _i++) {
            var instance = componentInstances_1[_i];
            if (instance === component && usedComponent) {
                continue;
            }
            context = translateUsedComponentInstance(instance, context);
        }
        return context;
    };
    var translateUsedComponentInstance = function (instance, context) {
        var overrideProp = "" + (instance.name === paperclip_1.PCSourceTagNames.COMPONENT
            ? "overrides"
            : "overrides._" + instance.id);
        context = utils_1.addOpenTag("var _" + instance.id + "ComponentImp = " + (!tandem_common_1.getNestedTreeNodeById(instance.is, context.entry.content)
            ? "_imports."
            : "") + "_" + instance.is + "(mergeProps({\n", context);
        context = translateUsedComponentOverrides(instance, context);
        var contentNode = paperclip_1.getPCNodeContentNode(instance.id, context.entry.content) || instance;
        context = translateStaticStyleOverride(instance.id, getAllNodeOverrides(instance.id, contentNode), context, true);
        context = utils_1.addCloseTag("}, " + overrideProp + "));\n", context);
        context = utils_1.addLine("var _" + instance.id + "Component = _" + instance.id + "ComponentImp.renderer;", context);
        context = utils_1.addLine("mergeProps(styleRules, _" + instance.id + "ComponentImp.styleRules);\n", context);
        return context;
    };
    var translateVariantSelectors = function (instance, map) {
        var variantSelectors = {};
        for (var variantId in instance.variant) {
            if (!instance.variant[variantId]) {
                continue;
            }
            if (!variantSelectors[variantId]) {
                variantSelectors[variantId] = [];
            }
            // tee-up for combo classes
            variantSelectors[variantId].push("._" + instance.id, "._" + instance.id + " ");
        }
        for (var key in map) {
            var instanceMap = map[key][instance.id] || tandem_common_1.EMPTY_OBJECT;
            var overrides = instanceMap.overrides || tandem_common_1.EMPTY_ARRAY;
            for (var _i = 0, overrides_1 = overrides; _i < overrides_1.length; _i++) {
                var override = overrides_1[_i];
                if (override.propertyName !== paperclip_1.PCOverridablePropertyName.VARIANT) {
                    continue;
                }
                var instancePathSelector = override.targetIdPath.map(function (id) { return "._" + id; });
                var newKey = void 0;
                if (key === paperclip_1.COMPUTED_OVERRIDE_DEFAULT_KEY) {
                    newKey = instance.id;
                }
                else {
                    newKey = key;
                }
                for (var variantId in override.value) {
                    if (!variantSelectors[variantId]) {
                        variantSelectors[variantId] = [];
                    }
                    var postfix = instancePathSelector.join(" ");
                    if (instancePathSelector.length !== 0 &&
                        !(override.targetIdPath.length === 1 &&
                            override.targetIdPath[0] === instance.id)) {
                        postfix += " ";
                    }
                    // tee-up for combo classes
                    variantSelectors[variantId].push("._" + newKey + " " + postfix);
                }
            }
        }
        return variantSelectors;
    };
    var getInstanceVariantOverrideMap = function (instance, map, context) {
        var newMap = {};
        for (var key in map) {
            var instanceMap = map[key][instance.id] || tandem_common_1.EMPTY_OBJECT;
            var overrides = instanceMap.overrides || tandem_common_1.EMPTY_ARRAY;
            for (var _i = 0, overrides_2 = overrides; _i < overrides_2.length; _i++) {
                var override = overrides_2[_i];
                if (override.propertyName !== paperclip_1.PCOverridablePropertyName.VARIANT) {
                    continue;
                }
                var newKey = void 0;
                if (key === paperclip_1.COMPUTED_OVERRIDE_DEFAULT_KEY) {
                    newKey = context.currentScope;
                }
                else {
                    newKey = key;
                }
                for (var variantId in override.value) {
                    if (!newMap[variantId]) {
                        newMap[variantId] = [];
                    }
                    // tee-up for combo classes
                    newMap[variantId].push([newKey]);
                }
            }
        }
        return newMap;
    };
    var translateUsedComponentOverrides = function (instance, context) {
        var contentNode = paperclip_1.getPCNodeContentNode(instance.id, context.entry.content) || instance;
        var overrideMap = paperclip_1.getOverrideMap(instance, contentNode);
        context = translateUsedComponentOverrideMap(paperclip_1.mergeVariantOverrides(overrideMap), context);
        var variantSelectors = translateVariantSelectors(instance, overrideMap);
        if (Object.keys(variantSelectors).length) {
            context = utils_1.addLine("variantPrefixSelectors: " + JSON.stringify(variantSelectors) + ",", context);
        }
        return context;
    };
    var translateUsedComponentOverrideMap = function (map, context) {
        for (var key in map) {
            var _a = map[key], children = _a.children, overrides = _a.overrides;
            if (mapContainsStaticOverrides(map[key])) {
                context = utils_1.addOpenTag("_" + key + ": {\n", context);
                for (var _i = 0, overrides_3 = overrides; _i < overrides_3.length; _i++) {
                    var override = overrides_3[_i];
                    context = translateStaticOverride(override, context);
                }
                context = translateStaticStyleOverride(key, overrides, context, false);
                context = translateUsedComponentOverrideMap(children, context);
                context = utils_1.addCloseTag("},\n", context);
            }
        }
        return context;
    };
    var translateStaticOverrides = function (component, context) {
        var visibleNodes = tandem_common_1.filterNestedNodes(component, function (node) { return paperclip_1.isVisibleNode(node) || node.name === paperclip_1.PCSourceTagNames.COMPONENT; });
        for (var _i = 0, visibleNodes_1 = visibleNodes; _i < visibleNodes_1.length; _i++) {
            var node = visibleNodes_1[_i];
            // overrides provided when component is created, so ski
            if (node.name === paperclip_1.PCSourceTagNames.COMPONENT && paperclip_1.extendsComponent(node)) {
                continue;
            }
            var overrideProp = "" + (node.name === paperclip_1.PCSourceTagNames.COMPONENT
                ? "overrides"
                : "overrides._" + node.id);
            if (node.name === paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE) {
                context = utils_1.addOpenTag("var _" + node.id + "StaticProps = {\n", context);
            }
            else {
                context = utils_1.addOpenTag("var _" + node.id + "StaticProps = mergeProps({\n", context);
            }
            if (node.name === paperclip_1.PCSourceTagNames.ELEMENT ||
                node.name === paperclip_1.PCSourceTagNames.COMPONENT ||
                node.name === paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE) {
                context = translateInnerAttributes(node.id, node.attributes, context);
            }
            context = utils_1.addLine("key: \"" + node.id + "\",", context);
            // class name provided in override
            if (node.name !== paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE) {
                context = translateStaticStyleOverride(node.id, getAllNodeOverrides(node.id, component), context);
            }
            if (node.name === paperclip_1.PCSourceTagNames.TEXT) {
                context = utils_1.addLine("text: " + JSON.stringify(node.value) + ",", context);
            }
            if (node.name === paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE) {
                context = utils_1.addCloseTag("};\n\n", context);
            }
            else {
                context = utils_1.addCloseTag("}, " + overrideProp + ", function(key) { return key.charAt(0) !== \"_\"; });\n\n", context);
            }
        }
        return context;
    };
    var getAllNodeOverrides = function (nodeId, contentNode) {
        var node = tandem_common_1.getNestedTreeNodeById(nodeId, contentNode);
        return tandem_common_1.getTreeNodesByName(paperclip_1.PCSourceTagNames.OVERRIDE, contentNode).filter(function (override) {
            return (lodash_1.last(override.targetIdPath) === nodeId ||
                (override.targetIdPath.length === 0 &&
                    node.children.indexOf(override) !== -1));
        });
    };
    var translateControllers = function (renderName, component, context) {
        if (!component.controllers) {
            return context;
        }
        var internalVarName = utils_1.getInternalVarName(component);
        var i = 0;
        for (var _i = 0, _a = component.controllers; _i < _a.length; _i++) {
            var relativePath = _a[_i];
            var controllerVarName = internalVarName + "Controller" + ++i;
            // TODO - need to filter based on language (javascript). to be provided in context
            context = utils_1.addLine("var " + controllerVarName + " = require(\"" + relativePath + "\");", context);
            context = utils_1.addLine(renderName + " = (" + controllerVarName + ".default || " + controllerVarName + ")(" + translators
                .getControllerParameters(renderName)
                .join(", ") + ");", context);
        }
        return context;
    };
    var translateContentNodeOverrides = function (component, context) {
        var instances = tandem_common_1.filterNestedNodes(component, function (node) {
            return node.name === paperclip_1.PCSourceTagNames.COMPONENT ||
                node.name === paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE;
        });
        for (var i = instances.length; i--;) {
            var instance = instances[i];
            context = translateDynamicOverrides(component, instance, null, context);
            context = translatePlugs(component, instance, context);
        }
        return context;
    };
    var translateContentNodeVariantOverrides = function (component, context) {
        // const instances = filterNestedNodes(
        //   component,
        //   node =>
        //     node.name === PCSourceTagNames.COMPONENT ||
        //     node.name === PCSourceTagNames.COMPONENT_INSTANCE
        // );
        var variants = paperclip_1.getPCVariants(component);
        for (var _i = 0, variants_2 = variants; _i < variants_2.length; _i++) {
            var variant = variants_2[_i];
            context = utils_1.addOpenTag("if (variant.indexOf(\"" + variant.id + "\") !== -1) {\n", context);
            context = utils_1.addLine("_" + context.currentScope + "Props." + parts.classAttributeName + " = (_" + context.currentScope + "Props." + parts.classAttributeName + " ? _" + context.currentScope + "Props." + parts.classAttributeName + " + \" \" : \"\") + \"_" + variant.id + "\";", context);
            // for (let i = instances.length; i--; ) {
            //   const instance = instances[i];
            //   const overrideMap = getOverrideMap(instance);
            //   if (!overrideMap[variant.id]) {
            //     continue;
            //   }
            //   context = translateDynamicOverrides(
            //     component,
            //     instance,
            //     variant.id,
            //     context
            //   );
            // }
            context = utils_1.addCloseTag("}\n", context);
        }
        return context;
    };
    var isComputedOverride = function (map) {
        return Boolean(map.children);
    };
    var mapContainersOverride = function (filter) {
        var check = tandem_common_1.memoize(function (map) {
            if (isComputedOverride(map)) {
                if (map.overrides.find(filter)) {
                    return true;
                }
                for (var childId in map.children) {
                    if (check(map.children[childId])) {
                        return true;
                    }
                }
            }
            else {
                for (var childId in map) {
                    if (check(map[childId])) {
                        return true;
                    }
                }
            }
            return false;
        });
        return check;
    };
    var isStaticOverride = function (override) {
        return override.propertyName !== paperclip_1.PCOverridablePropertyName.CHILDREN &&
            !override.variantId;
    };
    var isDynamicOverride = function (override) {
        return (override.propertyName === paperclip_1.PCOverridablePropertyName.CHILDREN &&
            override.children.length > 0) ||
            Boolean(override.variantId);
    };
    var mapContainsStaticOverrides = mapContainersOverride(isStaticOverride);
    var defineNestedObject = function (keyPath, setObject, context) {
        var _a, _b, _c;
        if (!context.definedObjects[context.currentScope]) {
            context = __assign(__assign({}, context), { definedObjects: __assign(__assign({}, context.definedObjects), (_a = {}, _a[context.currentScope] = {}, _a)) });
        }
        for (var i = 0, length_1 = keyPath.length; i < length_1; i++) {
            var currentPath = keyPath.slice(0, i + 1);
            var ref = currentPath.join(".");
            if (!context.definedObjects[context.currentScope][ref]) {
                if (setObject) {
                    context = utils_1.addOpenTag("if (" + ref + ") {\n", context);
                    context = utils_1.addLine(ref + " = Object.assign({}, " + ref + ");", context);
                    context = utils_1.addCloseTag("}", context);
                    context = utils_1.addOpenTag(" else {\n", context);
                    context = utils_1.addLine(ref + " = {};", context);
                    context = utils_1.addCloseTag("}\n", context);
                }
                context = __assign(__assign({}, context), { definedObjects: __assign(__assign({}, context.definedObjects), (_b = {}, _b[context.currentScope] = __assign(__assign({}, context.definedObjects[context.currentScope]), (_c = {}, _c[ref] = true, _c)), _b)) });
            }
        }
        return context;
    };
    var translateDynamicOverrideKeys = function (contentNode, context) {
        var instances = tandem_common_1.filterNestedNodes(contentNode, function (node) {
            return node.name === paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE ||
                node.name === paperclip_1.PCSourceTagNames.COMPONENT;
        });
        for (var _i = 0, instances_2 = instances; _i < instances_2.length; _i++) {
            var instance = instances_2[_i];
            var overrides = paperclip_1.getOverrides(instance);
            for (var _a = 0, overrides_4 = overrides; _a < overrides_4.length; _a++) {
                var override = overrides_4[_a];
                if (isDynamicOverride(override)) {
                    var keyPath = void 0;
                    if (tandem_common_1.getNestedTreeNodeById(lodash_1.last(override.targetIdPath), contentNode)) {
                        keyPath = ["_" + lodash_1.last(override.targetIdPath) + "Props"];
                    }
                    else {
                        keyPath = __spreadArrays([instance.id + "Props"], override.targetIdPath).map(function (id) { return "_" + id; });
                    }
                    context = defineNestedObject(keyPath, true, context);
                }
            }
        }
        return context;
    };
    var translatePlugs = function (component, instance, context) {
        var plugs = instance.children.filter(function (child) { return child.name === paperclip_1.PCSourceTagNames.PLUG; });
        for (var _i = 0, plugs_1 = plugs; _i < plugs_1.length; _i++) {
            var plug = plugs_1[_i];
            var visibleChildren = plug.children.filter(function (child) { return paperclip_1.isVisibleNode(child) || child.name === paperclip_1.PCSourceTagNames.SLOT; });
            var slot = paperclip_1.getPCNode(plug.slotId, context.graph);
            if (!slot) {
                console.log("Orphaned plug found for slot " + plug.slotId);
                continue;
            }
            // context = addScopedLayerLabel(slot.label, slot.id, context);
            var publicLayerVarName = slot.label && utils_1.makeSafeVarName(lodash_1.camelCase(slot.label));
            // We use the slot's name here so that developers can programatically override
            // the slot via controllers. This value should be unique, so if there's ever colliding slot names,
            // then there's an issue with the component file being translated.
            var slotPropName = publicLayerVarName || "_" + slot.id;
            context = utils_1.addOpenTag("if (!_" + instance.id + "Props." + slotPropName + ") {\n", context);
            context = utils_1.addOpenTag("_" + instance.id + "Props." + slotPropName + " = [\n", context);
            for (var _a = 0, visibleChildren_1 = visibleChildren; _a < visibleChildren_1.length; _a++) {
                var child = visibleChildren_1[_a];
                context = translateVisibleNode(child, context);
                context = utils_1.addLineItem(",\n", context);
            }
            context = utils_1.addCloseTag("];\n", context);
            context = utils_1.addCloseTag("}\n", context);
        }
        return context;
    };
    var translateDynamicOverrides = function (component, instance, variantId, context) {
        var overrides = paperclip_1.getOverrides(instance);
        for (var _i = 0, overrides_5 = overrides; _i < overrides_5.length; _i++) {
            var override = overrides_5[_i];
            if (isDynamicOverride(override) && override.variantId == variantId) {
                var keyPath = void 0;
                if (tandem_common_1.getNestedTreeNodeById(lodash_1.last(override.targetIdPath), component)) {
                    keyPath = ["_" + lodash_1.last(override.targetIdPath) + "Props"];
                }
                else {
                    keyPath = __spreadArrays([instance.id + "Props"], override.targetIdPath).map(function (id) { return "_" + id; });
                }
                context = translateDynamicOverrideSetter(keyPath.join("."), override, context);
            }
        }
        return context;
    };
    var hasDynamicOverrides = function (_a) {
        var children = _a.children, overrides = _a.overrides;
        for (var _i = 0, overrides_6 = overrides; _i < overrides_6.length; _i++) {
            var override = overrides_6[_i];
            if (override.propertyName === paperclip_1.PCOverridablePropertyName.CHILDREN) {
                return true;
            }
        }
        for (var key in children) {
            if (hasDynamicOverrides(children[key])) {
                return true;
            }
        }
        return false;
    };
    var translateDynamicOverrideSetter = function (varName, override, context) {
        if (override.variantId) {
            switch (override.propertyName) {
                case paperclip_1.PCOverridablePropertyName.STYLE: {
                    context = utils_1.addLine(varName + "." + parts.classAttributeName + " = (" + varName + "." + parts.classAttributeName + " ? " + varName + "." + parts.classAttributeName + " + \" \" : \"\") + \"_" + override.id + " _" + override.variantId + "\";", context);
                    return context;
                }
                case paperclip_1.PCOverridablePropertyName.VARIANT: {
                    context = utils_1.addLine(varName + ".variant = (" + varName + ".variant ? " + varName + ".variant + \" \" : \"\") + \"" + Object.keys(override.value).join(" ") + "\";", context);
                    return context;
                }
            }
        }
        return context;
    };
    var translateStaticOverride = function (override, context) {
        if (override.variantId) {
            return context;
        }
        switch (override.propertyName) {
            case paperclip_1.PCOverridablePropertyName.TEXT: {
                return utils_1.addLine("text: " + JSON.stringify(override.value) + ",", context);
            }
            case paperclip_1.PCOverridablePropertyName.VARIANT: {
                return utils_1.addLine("variant: \"" + Object.keys(override.value).join(" ") + "\",", context);
            }
            case paperclip_1.PCOverridablePropertyName.ATTRIBUTES: {
                context = translateInnerAttributes(lodash_1.last(override.targetIdPath), override.value, context);
                break;
            }
        }
        return context;
    };
    var translateStaticStyleOverride = function (nodeId, overrides, context, includeNodeId) {
        if (includeNodeId === void 0) { includeNodeId = true; }
        var styleOverrides = overrides.filter(function (override) { return override.propertyName === paperclip_1.PCOverridablePropertyName.STYLE; });
        if (!styleOverrides.length && !includeNodeId) {
            return context;
        }
        var nodeIds = styleOverrides.map(function (override) { return override.id; });
        if (includeNodeId) {
            nodeIds = __spreadArrays([nodeId], nodeIds);
        }
        context = utils_1.addLine("\"" + parts.classAttributeName + "\": \"" + nodeIds
            .map(function (nodeId) { return "_" + nodeId; })
            .join(" ") + "\", ", context);
        return context;
    };
    var canTranslateAttributeKey = function (key) {
        return !/xmlns/.test(key) &&
            key.indexOf(":") === -1 &&
            key !== "style" &&
            key !== "class";
    };
    var translateInnerAttributes = function (nodeId, attributes, context) {
        var node = paperclip_1.getPCNode(nodeId, context.graph);
        if (!node) {
            return utils_1.addWarning(new Error("cannot find PC node"), context);
        }
        for (var key in attributes) {
            if (!canTranslateAttributeKey(key)) {
                continue;
            }
            var value = JSON.stringify(attributes[key]);
            if (key === "src" && node.is === "img") {
                value = "require(" + value + ")";
            }
            context = utils_1.addLine(utils_1.makeSafeVarName(lodash_1.camelCase(key)) + ": " + value + ",", context);
        }
        return context;
    };
    var getNodePropsVarName = function (node, context) {
        return node.name === paperclip_1.PCSourceTagNames.COMPONENT
            ? "props"
            : "" + utils_1.getPublicLayerVarName(node.label + " Props", node.id, context);
    };
    var hasStyle = function (node) {
        return (Object.keys(node.style).length > 0 ||
            (node.styleMixins && Object.keys(node.styleMixins).length > 0));
    };
    var translateVisibleNode = function (node, context) {
        switch (node.name) {
            case paperclip_1.PCSourceTagNames.TEXT: {
                var textValue = "_" + node.id + "Props.text || " + JSON.stringify(node.value);
                if (hasStyle(node)) {
                    return utils_1.addLineItem(parts.elementCreator + "(\"span\", _" + node.id + "Props, " + textValue + ")", context);
                }
                else {
                    return utils_1.addLineItem(textValue, context);
                }
            }
            case paperclip_1.PCSourceTagNames.COMPONENT_INSTANCE:
            case paperclip_1.PCSourceTagNames.ELEMENT: {
                return translateElement(node, context);
            }
            case paperclip_1.PCSourceTagNames.SLOT: {
                return translateSlot(node, context);
            }
        }
        return context;
    };
    var translateSlot = function (slot, context) {
        var visibleChildren = slot.children.filter(function (child) { return paperclip_1.isVisibleNode(child) || paperclip_1.isSlot(child); });
        context = utils_1.addScopedLayerLabel(slot.label, slot.id, context);
        var slotPropName = utils_1.getPublicLayerVarName(slot.label, slot.id, context);
        if (slotPropName) {
            context = utils_1.addLineItem("_" + context.currentScope + "Props." + slotPropName + " || ", context);
        }
        context = utils_1.addLineItem("_" + context.currentScope + "Props._" + slot.id, context);
        if (visibleChildren.length) {
            context = utils_1.addOpenTag(" || [\n", context);
            context = visibleChildren.reduce(function (context, node, index, array) {
                context = translateVisibleNode(node, context);
                if (index < array.length - 1) {
                    context = utils_1.addBuffer(",", context);
                }
                return utils_1.addLine("", context);
            }, context);
            context = utils_1.addCloseTag("]", context);
        }
        return context;
    };
    var translateElement = function (elementOrComponent, context) {
        var visibleChildren = elementOrComponent.children.filter(function (child) { return paperclip_1.isVisibleNode(child) || paperclip_1.isSlot(child); });
        var hasVisibleChildren = visibleChildren.length > 0;
        context = utils_1.addOpenTag(parts.elementCreator + "(", context, hasVisibleChildren);
        context = utils_1.addLineItem((paperclip_1.extendsComponent(elementOrComponent)
            ? "_" + elementOrComponent.id + "Component"
            : '"' + elementOrComponent.is + '"') + ", ", context);
        if (!paperclip_1.extendsComponent(elementOrComponent)) {
            context = utils_1.addLineItem("_toNativeProps(_" + elementOrComponent.id + "Props)", context);
        }
        else {
            context = utils_1.addLineItem("_" + elementOrComponent.id + "Props", context);
        }
        // TODO - deprecate child overrides like this
        context = utils_1.addLineItem(", _" + elementOrComponent.id + "Props.children", context);
        if (visibleChildren.length) {
            context = utils_1.addLineItem(" || [\n", context);
            context = visibleChildren.reduce(function (context, node, index, array) {
                context = translateVisibleNode(node, context);
                if (index < array.length - 1) {
                    context = utils_1.addBuffer(",", context);
                }
                return utils_1.addLine("", context);
            }, context);
        }
        else if (hasVisibleChildren) {
            context = utils_1.addLineItem("\n", context);
        }
        context = utils_1.addCloseTag(hasVisibleChildren ? "])" : ")", context, hasVisibleChildren);
        return context;
    };
    return function (entry, graph, rootDirectory, options) {
        if (options === void 0) { options = tandem_common_1.EMPTY_OBJECT; }
        return translateModule(entry.content, {
            options: options,
            entry: entry,
            buffer: "",
            graph: graph,
            definedObjects: {},
            scopedLabelRefs: {},
            depth: 0,
            warnings: [],
            rootDirectory: rootDirectory
        });
    };
};
//# sourceMappingURL=code-compiler.js.map