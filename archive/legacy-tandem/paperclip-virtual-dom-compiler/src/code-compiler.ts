// TODOS:
// - variants for props
// - variants for classes
// - tests**
import {
  PCModule,
  PCVisibleNode,
  PCElement,
  PCComponent,
  PCComponentInstanceElement,
  PCSourceTagNames,
  PCNode,
  extendsComponent,
  PCStyleOverride,
  isVisibleNode,
  getOverrides,
  getPCNode,
  isComponent,
  PCDependency,
  DependencyGraph,
  getComponentRefIds,
  getPCNodeDependency,
  getOverrideMap,
  COMPUTED_OVERRIDE_DEFAULT_KEY,
  PCComputedOverrideVariantMap,
  PCOverride,
  PCOverridablePropertyName,
  PCComputedNoverOverrideMap,
  isPCComponentInstance,
  computeStyleValue,
  isPCComponentOrInstance,
  getVariantTriggers,
  PCMediaQuery,
  StyleMixins,
  isSlot,
  PCSlot,
  PCStyleMixin,
  PCComputedOverrideMap,
  mergeVariantOverrides,
  getPCNodeContentNode,
  PCVariant,
  PCVariantTrigger,
  PCPlug,
  PCBaseElementChild,
  getAllVariableRefMap,
  PCVariantTriggerSourceType,
  PCQuery,
  variableQueryPassed,
  PCVariantTriggerQuerySource,
  getPCNodeModule,
  getPCVariants,
} from "@paperclip-lang/core";
import { camelCase, uniq, last, negate } from "lodash";
import {
  flattenTreeNode,
  EMPTY_OBJECT,
  getNestedTreeNodeById,
  stripProtocol,
  filterNestedNodes,
  memoize,
  EMPTY_ARRAY,
  getTreeNodesByName,
  getParentTreeNode,
} from "tandem-common";
import * as path from "path";
import {
  TranslateOptions,
  addWarning,
  ContentNode,
  getPublicLayerVarName,
  TranslateContext,
  addOpenTag,
  addCloseTag,
  addBuffer,
  addLine,
  getInternalVarName,
  addLineItem,
  setCurrentScope,
  addScopedLayerLabel,
  makeSafeVarName,
} from "./utils";
import { PCQueryType } from "@paperclip-lang/core";

export type TranslateParts = {
  elementCreator: string;
  classAttributeName: string;
};

export type Translators = {
  getControllerParameters: (firstParam: string) => string[];
  getBaseRenderName: (
    contentNode: ContentNode,
    context: TranslateContext
  ) => string;
  getPublicRenderName: (
    contentNode: ContentNode,
    context: TranslateContext
  ) => string;
  translateModule: (
    module: PCModule,
    context: TranslateContext,
    inner: (context: TranslateContext) => TranslateContext
  ) => TranslateContext;
  translateRenderer: (
    contentNode: ContentNode,
    context: TranslateContext,
    inner: (context: TranslateContext) => TranslateContext
  ) => TranslateContext;
};

export const createPaperclipVirtualDOMtranslator = (
  parts: TranslateParts,
  translators: Translators
) => {
  const translateModule = (module: PCModule, context: TranslateContext) => {
    context = translators.translateModule(module, context, (context) => {
      const imports = uniq(
        getComponentRefIds(module)
          .map((refId: string) => {
            return getPCNodeDependency(refId, context.graph);
          })
          .filter((dep) => dep && dep !== context.entry)
      );

      if (imports.length) {
        context = addLine(`\nvar _imports = {};`, context);
        for (const { uri } of imports) {
          // Change Windows OS path to Unix
          let relativePath = path
            .relative(
              path.dirname(stripProtocol(context.entry.uri)),
              stripProtocol(uri)
            )
            .replace(/\\/g, "/");

          if (relativePath.charAt(0) !== ".") {
            relativePath = "./" + relativePath;
          }

          context = addLine(
            `Object.assign(_imports, require("${relativePath}"));`,
            context
          );
        }
      }

      context = addToNativePropsFunction(context);
      context = addMergeFunction(context);
      context = addStylesToDocumentFunction(context);

      context = addLine("\nvar _EMPTY_OBJECT = {}", context);
      context = addLine("\nvar EMPTY_ARRAY = []", context);

      context = module.children
        .filter(isComponent)
        .reduce(
          (context, component: PCComponent) =>
            translateContentNode(component, module, context),
          context
        );

      if (context.options.compileNonComponents !== false) {
        context = module.children
          .filter(negate(isComponent))
          .reduce(
            (context, component: ContentNode) =>
              translateContentNode(component, module, context),
            context
          );
      }

      return context;
    });

    return context;
  };

  const addToNativePropsFunction = (context: TranslateContext) => {
    context = addOpenTag(`\nfunction _toNativeProps(props) {\n`, context);
    context = addLine(`var newProps = {};`, context);
    context = addOpenTag(`for (var key in props) {\n`, context);
    context = addLine(`var value = props[key];`, context);
    context = addLine(`var tov = typeof value;`, context);
    context = addOpenTag(
      `if(((tov !== "object" || key === "ref") && key !== "text" && (tov !== "function" || key === "ref" || key.substr(0, 2) === "on")) || key === "style") {\n`,
      context
    );
    context = addLine(`newProps[key] = value;`, context);
    context = addCloseTag(`}\n`, context);
    context = addCloseTag(`}\n`, context);
    context = addLine(`return newProps;`, context);
    context = addCloseTag(`}\n`, context);
    return context;
  };

  const addMergeFunction = (context: TranslateContext) => {
    context = addOpenTag(
      `\nfunction mergeProps(target, object, keyFilter) {\n`,
      context
    );
    context = addLine(`if (object == null) return target; `, context);
    context = addLine(
      `if (!target || typeof object !== 'object' || Array.isArray(object)) return object; `,
      context
    );
    context = addOpenTag(`for (var key in object) {\n`, context);
    context = addOpenTag(
      `if (!keyFilter || keyFilter(key, object)) {\n`,
      context
    );
    context = addLine(
      `target[key] = key === "${parts.classAttributeName}" ? (target[key] ?  object[key] + " " + target[key] : object[key]) : mergeProps(target[key], object[key], keyFilter);`,
      context
    );
    context = addCloseTag(`}\n`, context);
    context = addCloseTag(`}\n`, context);
    context = addLine(`return target;`, context);
    context = addCloseTag(`}\n`, context);
    return context;
  };

  const addStylesToDocumentFunction = (context: TranslateContext) => {
    context = addLine(
      `// messy, but we need a way to skip selectors that have already been injected into the document`,
      context
    );
    context = addLine(
      `var stringifiedStyles = typeof window !== "undefined" ? window.__stringifiedStyles || (window.__stringifiedStyles = {}) : {};`,
      context
    );
    context = addOpenTag(
      `\nfunction stringifyStyleRulesInner(key, value) {\n`,
      context
    );
    context = addLine(
      `if (typeof value === "string") return key + ":" + value + ";\\n"`,
      context
    );
    context = addLine(
      `if (key.charAt(0) !== "@" && stringifiedStyles[key]) return ""`,
      context
    );
    context = addLine(`stringifiedStyles[key] = true;`, context);
    context = addLine(
      `return key + "{\\n" + stringifyStyleRules(value) + "}\\n"`,
      context
    );
    context = addCloseTag(`}\n`, context);

    context = addOpenTag(
      `\nfunction stringifyStyleRules(styleRules) {\n`,
      context
    );
    context = addLine(`var buffer = [];`, context);
    context = addOpenTag(`for (const key in styleRules) {\n`, context);
    context = addLine(
      `buffer.push(stringifyStyleRulesInner(key, styleRules[key]));`,
      context
    );
    context = addCloseTag(`}\n`, context);
    context = addLine(`return buffer.join("");`, context);
    context = addCloseTag(`}\n`, context);

    context = addOpenTag(
      `\nfunction addStylesToDocument(styleRules) {\n`,
      context
    );
    context = addLine(`if (typeof document === "undefined") return;`, context);
    context = addLine(
      `var cssText = stringifyStyleRules(styleRules);`,
      context
    );
    context = addLine(`var style = document.createElement("style");`, context);
    context = addLine(`style.type = "text/css";`, context);
    context = addLine(`style.textContent = cssText;`, context);
    context = addLine(`document.head.appendChild(style);`, context);

    context = addCloseTag(`}\n`, context);
    return context;
  };

  const translateComponentStyles = (
    component: ContentNode,
    context: TranslateContext
  ) => {
    // basic styles

    context = translateComponentStyleInner(component, context);

    // variant styles

    context = addLine(
      `const styleVariantKey = (overrides.variantPrefixSelectors ? JSON.stringify(overrides.variantPrefixSelectors) : "${component.id}") + "Style";`,
      context
    );
    context = translateStyleOverrides(component, context);
    return context;
  };

  const translateComponentStyleInner = (
    component: ContentNode,
    context: TranslateContext
  ) => {
    context = flattenTreeNode(component)
      .filter(
        (node: PCNode) =>
          isVisibleNode(node) || node.name === PCSourceTagNames.COMPONENT
      )
      .reduce((context, node: ContentNode) => {
        if (!hasStyle(node)) {
          return context;
        }
        context = addOpenTag(`mergeProps(styleRules, {\n`, context);
        context = addOpenTag(`"._${node.id}": {\n`, context);
        context = translateStyle(
          node,
          { ...getInheritedStyle(node.styleMixins, context), ...node.style },
          context,
          getPCNodeDependency(node.id, context.graph).uri
        );
        context = addCloseTag(`}\n`, context);
        context = addCloseTag(`});\n\n`, context);
        return context;
      }, context);

    return context;
  };

  const isSVGPCNode = memoize((node: PCNode, graph: DependencyGraph) => {
    return (
      node &&
      ((node as PCElement).is === "svg" ||
        isSVGPCNode(
          getParentTreeNode(node.id, getPCNodeModule(node.id, graph)),
          graph
        ))
    );
  });

  const SVG_STYLE_PROP_MAP = {
    background: "fill",
  };

  const getInheritedStyle = (
    styleMixins: StyleMixins,
    context: TranslateContext,
    computed = {}
  ) => {
    if (!styleMixins) {
      return {};
    }
    const styleMixinIds = Object.keys(styleMixins)
      .filter((a) => Boolean(styleMixins[a]))
      .sort((a, b) =>
        styleMixins[a].priority > styleMixins[b].priority ? 1 : -1
      );

    return styleMixinIds.reduce((style, styleMixinId) => {
      const styleMixin = getPCNode(styleMixinId, context.graph) as PCStyleMixin;
      if (!styleMixin) {
        return style;
      }
      const compStyle =
        computed[styleMixinId] ||
        (computed[styleMixinId] = {
          ...getInheritedStyle(styleMixin.styleMixins, context, computed),
          ...styleMixin.style,
        });
      return { ...style, ...compStyle };
    }, {});
  };

  const stringifyValue = (value: string) => {
    let newValue = JSON.stringify(value);
    return newValue.substr(1, newValue.length - 2);
  };

  const translateStyle = (
    target: ContentNode,
    style: any,
    context: TranslateContext,
    sourceUri: string
  ) => {
    const isSVG = isSVGPCNode(target, context.graph);

    if (isSVG) {
      // TODO - add vendor prefix stuff here
      for (const key in style) {
        const propName = key;
        context = addLine(
          `"${SVG_STYLE_PROP_MAP[propName] || propName}": "${stringifyValue(
            translateStyleValue(key, style[key], context, sourceUri).replace(
              /[\n\r]/g,
              " "
            )
          )}",`,
          context
        );
      }
    } else {
      // TODO - add vendor prefix stuff here
      for (const key in style) {
        context = addLine(
          `"${key}": "${translateStyleValue(
            key,
            style[key],
            context,
            sourceUri
          ).replace(/[\n\r]/g, " ")}",`,
          context
        );
      }
    }

    return context;
  };

  const translateStyleOverrides = (
    contentNode: ContentNode,
    context: TranslateContext
  ) => {
    const instances = filterNestedNodes(
      contentNode,
      (node) =>
        node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
        node.name === PCSourceTagNames.COMPONENT
    );

    for (const instance of instances) {
      context = translateStyleVariantOverrides(
        instance as PCComponentInstanceElement,
        contentNode,
        context
      );
    }

    return context;
  };

  const translateStyleVariantOverrides = (
    instance: PCComponentInstanceElement | PCComponent,
    component: ContentNode,
    context: TranslateContext
  ) => {
    // FIXME: need to sort based on variant priority
    const styleOverrides = (
      getOverrides(instance).filter(
        (node) =>
          node.propertyName === PCOverridablePropertyName.STYLE &&
          Object.keys(node.value).length
      ) as PCStyleOverride[]
    ).sort((a, b) => {
      return a.variantId ? 1 : -1;
    });

    for (const override of styleOverrides) {
      // console.log(instance.id, component.id, override.targetIdPath.length === 0 && instance.id === component.id);

      // override id is added as className to target element when imported. Necessary
      // to ensure that edge-cases like portals still maintain override values.
      let targetSelector = `._${
        override.targetIdPath.length === 0 && instance.id === component.id
          ? instance.id
          : override.id
      }`;
      let selector = targetSelector;
      let baseSelector = selector;

      // If an instance, then is a child of component and we should include in the scope
      // of the style override to ensure that we don't override other instances.
      // if (instance.name === PCSourceTagNames.COMPONENT_INSTANCE) {
      //   selector = `._${instance.id} ${selector}`;
      // }

      // if variant is defined, then it will be defined at the component level. Note that
      // we'll need to include combo variants here at some point. Also note that component ID isn't necessary
      // here since variant IDS are specific to components.
      let mediaTriggers: PCVariantTrigger[] = [];
      let variableTriggerPassed: boolean;
      if (override.variantId) {
        const variant = getPCNode(
          override.variantId,
          context.graph
        ) as PCVariant;

        const variantTriggers =
          (variant && getVariantTriggers(variant, component as PCComponent)) ||
          EMPTY_ARRAY;

        const queryTriggers = variantTriggers.filter(
          (trigger) =>
            trigger.source &&
            trigger.source.type === PCVariantTriggerSourceType.QUERY
        );

        variableTriggerPassed = queryTriggers.some((trigger) => {
          const query = getPCNode(
            (trigger.source as PCVariantTriggerQuerySource).queryId,
            context.graph
          ) as PCQuery;
          if (query && query.type == PCQueryType.VARIABLE) {
            return variableQueryPassed(
              query,
              getAllVariableRefMap(context.graph)
            );
          }

          return false;
        });

        if (variableTriggerPassed) {
          selector = `${targetSelector}`;
        } else {
          baseSelector = `" + (overrides.variantPrefixSelectors && overrides.variantPrefixSelectors["${override.variantId}"] && overrides.variantPrefixSelectors["${override.variantId}"].map(prefix => prefix + "${targetSelector}").join(", ") + ", " || "") + " `;

          selector = `${baseSelector} ._${override.variantId} ${targetSelector}, ._${override.variantId}${targetSelector}`;
        }

        mediaTriggers = queryTriggers.filter((trigger) => {
          const query = getPCNode(
            (trigger.source as PCVariantTriggerQuerySource).queryId,
            context.graph
          ) as PCQuery;
          return query && query.type === PCQueryType.MEDIA;
        });

        const variantTriggerSelectors = variantTriggers
          .map((trigger) => {
            if (!trigger.source) {
              return null;
            }
            if (trigger.source.type === PCVariantTriggerSourceType.STATE) {
              let prefix = `._${component.id}:${trigger.source.state}`;

              if (targetSelector !== `._${component.id}`) {
                return `${prefix} ${targetSelector}`;
              }

              return prefix;
            }
          })
          .filter(Boolean);

        if (variantTriggerSelectors.length) {
          selector += ", " + variantTriggerSelectors.join(", ");
        }
      }

      context = addOpenTag(`mergeProps(styleRules, {\n`, context);
      context = addOpenTag(`["${selector}"]: {\n`, context);
      context = translateStyle(
        getPCNode(last(override.targetIdPath), context.graph) as ContentNode,
        override.value,
        context,
        getPCNodeDependency(override.id, context.graph).uri
      );
      context = addCloseTag(`}\n`, context);
      context = addCloseTag(`});\n\n`, context);

      if (mediaTriggers.length && !variableTriggerPassed) {
        let mediaText = "@media all";

        mediaText += mediaTriggers
          .map((trigger) => {
            let buffer = "";
            const source = trigger.source as PCVariantTriggerQuerySource;
            const mediaQuery = getPCNode(
              source.queryId,
              context.graph
            ) as PCMediaQuery;
            if (!mediaQuery) {
              return null;
            }
            if (mediaQuery.condition && mediaQuery.condition.minWidth) {
              buffer += ` and (min-width: ${px(
                mediaQuery.condition.minWidth
              )})`;
            }
            if (mediaQuery.condition && mediaQuery.condition.maxWidth) {
              buffer += ` and (max-width: ${px(
                mediaQuery.condition.maxWidth
              )})`;
            }

            return buffer;
          })
          .filter(Boolean)
          .join(", ");
        context = addOpenTag(`mergeProps(styleRules, {\n`, context);
        context = addOpenTag(`["${mediaText}"]: {\n`, context);
        context = addOpenTag(
          `["${baseSelector} ${targetSelector}"]: {\n`,
          context
        );
        context = translateStyle(
          getPCNode(last(override.targetIdPath), context.graph) as ContentNode,
          override.value,
          context,
          getPCNodeDependency(override.id, context.graph).uri
        );
        context = addCloseTag(`}\n`, context);
        context = addCloseTag(`}\n`, context);
        context = addCloseTag(`});\n\n`, context);
      }
    }
    return context;
  };

  const px = (value: any) => {
    if (!isNaN(Number(value))) {
      return `${value}px`;
    }
    return value;
  };

  const translateStyleValue = (
    key: string,
    value: any,
    { graph, rootDirectory }: TranslateContext,
    sourceUri
  ) => {
    value = computeStyleValue(value, getAllVariableRefMap(graph));
    if (typeof value === "number" && key !== "opacity") {
      return value + "px";
    }

    if (typeof value === "string") {
      if (/url\(.*?\)/.test(value) && !/https?:\/\//.test(value)) {
        let uri = value.match(/url\(["']?(.*?)["']?\)/)[1];
        if (uri.charAt(0) === ".") {
          uri = `${path.dirname(sourceUri)}/${uri}`;
        } else {
          uri = `file://${stripProtocol(rootDirectory)}/${uri}`;
        }

        value = value.replace(/url\(["']?(.*?)["']?\)/, `url(${uri})`);

        // strip file if it exists.
        // value = value.replace("file://", "");
        // value = value.replace(
        //   /url\(["']?(.*?)["']?\)/,
        //   `url(" + require("$1") + ")`
        // );
      } else {
        value = stringifyValue(value);
      }
    }

    return String(value);
  };

  const translateContentNode = (
    contentNode: ContentNode,
    module: PCModule,
    context: TranslateContext
  ) => {
    context = setCurrentScope(module.id, context);

    context = addScopedLayerLabel(contentNode.label, contentNode.id, context);
    const internalVarName = getInternalVarName(contentNode);

    context = addOpenTag(
      `\nfunction ${internalVarName}(overrides) {\n`,
      context
    );

    context = addLine(`var styleRules = {};`, context);

    context = translatedUsedComponentInstances(contentNode, context);
    context = translateStaticOverrides(contentNode, context);

    if (context.options.includeCSS !== false) {
      context = translateComponentStyles(contentNode, context);
    }

    const variantLabelMap = getVariantLabelMap(contentNode);

    context = addOpenTag(`const VARIANT_LABEL_ID_MAP = {\n`, context);
    for (const id in variantLabelMap) {
      context = addLine(`"${variantLabelMap[id][0]}": "${id}",`, context);
    }
    context = addCloseTag(`};\n`, context);

    context = addLine(`var _variantMapCache = {};\n`, context);
    context = addOpenTag(`var getVariantMap = function(variant) {\n`, context);
    context = addLine(
      `return _variantMapCache[variant] || (_variantMapCache[variant] = variant.split(" ").map(function(label) { return VARIANT_LABEL_ID_MAP[label.trim()] || label.trim(); }));`,
      context
    );
    context = addCloseTag(`};\n\n`, context);

    const baseRenderName = translators.getBaseRenderName(contentNode, context);
    const publicRenderName = translators.getPublicRenderName(
      contentNode,
      context
    );

    context = translators.translateRenderer(contentNode, context, (context) => {
      if (
        isPCComponentOrInstance(contentNode) &&
        !extendsComponent(contentNode)
      ) {
        context = addLineItem(
          `var _${contentNode.id}Props = Object.assign({}, _${contentNode.id}StaticProps, props);\n`,
          context
        );
        context = addClassNameCheck(`${contentNode.id}`, `props`, context);
      } else {
        context = addLine(
          `var _${contentNode.id}Props = Object.assign({}, overrides, props);`,
          context
        );
      }
      context = addLine(
        `var variant = props.variant != null ? getVariantMap(props.variant) : EMPTY_ARRAY;`,
        context
      );

      context = setCurrentScope(contentNode.id, context);
      context = defineNestedObject([`_${contentNode.id}Props`], false, context);
      context = flattenTreeNode(contentNode)
        .filter((node) => isVisibleNode(node as any))
        .reduce((context, node: ContentNode) => {
          if (node === contentNode) return context;
          context = addScopedLayerLabel(
            `${node.label} Props`,
            node.id,
            context
          );

          const propsVarName = getNodePropsVarName(node, context);

          context = defineNestedObject([`_${node.id}Props`], false, context);
          // context = addLineItem(`var _${node.id}Props = (_${contentNode.id}Props.${propsVarName} || _${contentNode.id}Props._${node.id}) && `, context);
          context = addLine(
            `var _${node.id}Props = Object.assign({}, _${node.id}StaticProps, _${contentNode.id}Props._${node.id}, _${contentNode.id}Props.${propsVarName});`,
            context
          );

          if (node.name !== PCSourceTagNames.COMPONENT_INSTANCE) {
            context = addClassNameCheck(node.id, `_${node.id}Props`, context);
          }

          // context = addLine(
          //   `_${node.id}Props = Object.assign({}, _${node.id}StaticProps, _${
          //     node.id
          //   }Props);`,
          //   context
          // );

          return context;
        }, context);

      context = addLine("", context);

      // variants need to come first since there may be child overrides that have variant styles

      context = translateDynamicOverrideKeys(contentNode, context);
      context = translateContentNodeVariantOverrides(contentNode, context);
      context = translateContentNodeOverrides(contentNode, context);

      context = addLine("", context);
      context = addLineItem("return ", context);
      if (contentNode.name === PCSourceTagNames.TEXT) {
        context = addOpenTag(`${parts.elementCreator}('span', null, `, context);
        context = translateVisibleNode(contentNode, context);
        context = addCloseTag(`);`, context);
      } else {
        context = translateElement(contentNode, context);
      }
      context = addLine(";", context);
      return context;
    });

    if (isComponent(contentNode)) {
      context = translateControllers(baseRenderName, contentNode, context);
    }

    context = addLine(
      `return { renderer: ${baseRenderName}, styleRules: styleRules };`,
      context
    );

    context = addCloseTag(`};\n`, context);

    // necessary or other imported modules
    context = addLine(
      `\nexports.${internalVarName} = ${internalVarName};`,
      context
    );
    context = addLine(
      `var ${publicRenderName}Imp = ${internalVarName}({});`,
      context
    );
    context = addLine(
      `exports.${publicRenderName} = ${publicRenderName}Imp.renderer;`,
      context
    );
    context = addLine(
      `addStylesToDocument(${publicRenderName}Imp.styleRules);`,
      context
    );
    return context;
  };

  const getVariantLabelMap = (contentNode: ContentNode) => {
    const map = {};
    const variants = getPCVariants(contentNode);
    for (const variant of variants) {
      map[variant.id] = [
        makeSafeVarName(camelCase(variant.label)),
        variant.isDefault,
      ];
    }
    return map;
  };

  const addClassNameCheck = (
    id: string,
    varName: string,
    context: TranslateContext
  ) => {
    context = addOpenTag(
      `if(${varName}.${parts.classAttributeName} !== _${id}StaticProps.${parts.classAttributeName}) {\n`,
      context
    );
    context = addLine(
      `_${id}Props.${parts.classAttributeName} = _${id}StaticProps.${parts.classAttributeName} + (${varName}.${parts.classAttributeName} ? " " + ${varName}.${parts.classAttributeName} : "");`,
      context
    );
    context = addCloseTag(`}\n\n`, context);
    return context;
  };

  const translatedUsedComponentInstances = (
    component: ContentNode,
    context: TranslateContext
  ) => {
    const componentInstances = filterNestedNodes(
      component,
      isPCComponentInstance
    );

    // dirty 🙈
    let usedComponent = false;

    if (isPCComponentOrInstance(component) && extendsComponent(component)) {
      usedComponent = true;
      context = translateUsedComponentInstance(
        component as PCComponentInstanceElement,
        context
      );
    }
    for (const instance of componentInstances) {
      if (instance === component && usedComponent) {
        continue;
      }
      context = translateUsedComponentInstance(
        instance as PCComponentInstanceElement,
        context
      );
    }
    return context;
  };

  const translateUsedComponentInstance = (
    instance: PCComponentInstanceElement | PCComponent,
    context: TranslateContext
  ) => {
    const overrideProp = `${
      instance.name === PCSourceTagNames.COMPONENT
        ? "overrides"
        : `overrides._${instance.id}`
    }`;

    context = addOpenTag(
      `var _${instance.id}ComponentImp = ${
        !getNestedTreeNodeById(instance.is, context.entry.content)
          ? "_imports."
          : ""
      }_${instance.is}(mergeProps({\n`,
      context
    );
    context = translateUsedComponentOverrides(instance, context);
    const contentNode =
      getPCNodeContentNode(instance.id, context.entry.content) || instance;
    context = translateStaticStyleOverride(
      instance.id,
      getAllNodeOverrides(instance.id, contentNode),
      context,
      true
    );
    context = addCloseTag(`}, ${overrideProp}));\n`, context);
    context = addLine(
      `var _${instance.id}Component = _${instance.id}ComponentImp.renderer;`,
      context
    );
    context = addLine(
      `mergeProps(styleRules, _${instance.id}ComponentImp.styleRules);\n`,
      context
    );
    return context;
  };

  const translateVariantSelectors = (
    instance: PCComponentInstanceElement | PCComponent,
    map: PCComputedOverrideMap
  ) => {
    const variantSelectors = {};

    for (const variantId in instance.variant) {
      if (!instance.variant[variantId]) {
        continue;
      }
      if (!variantSelectors[variantId]) {
        variantSelectors[variantId] = [];
      }

      // tee-up for combo classes
      variantSelectors[variantId].push(`._${instance.id}`, `._${instance.id} `);
    }

    for (const key in map) {
      const instanceMap = map[key][instance.id] || EMPTY_OBJECT;

      const overrides: PCOverride[] = instanceMap.overrides || EMPTY_ARRAY;
      for (const override of overrides) {
        if (override.propertyName !== PCOverridablePropertyName.VARIANT) {
          continue;
        }

        let instancePathSelector = override.targetIdPath.map((id) => `._${id}`);

        let newKey: string;

        if (key === COMPUTED_OVERRIDE_DEFAULT_KEY) {
          newKey = instance.id;
        } else {
          newKey = key;
        }

        for (const variantId in override.value) {
          if (!variantSelectors[variantId]) {
            variantSelectors[variantId] = [];
          }

          let postfix = instancePathSelector.join(" ");

          if (
            instancePathSelector.length !== 0 &&
            !(
              override.targetIdPath.length === 1 &&
              override.targetIdPath[0] === instance.id
            )
          ) {
            postfix += " ";
          }

          // tee-up for combo classes
          variantSelectors[variantId].push(`._${newKey} ${postfix}`);
        }
      }
    }

    return variantSelectors;
  };

  const getInstanceVariantOverrideMap = (
    instance: PCComponentInstanceElement | PCComponent,
    map: PCComputedOverrideMap,
    context: TranslateContext
  ) => {
    const newMap = {};

    for (const key in map) {
      const instanceMap = map[key][instance.id] || EMPTY_OBJECT;

      const overrides = instanceMap.overrides || EMPTY_ARRAY;
      for (const override of overrides) {
        if (override.propertyName !== PCOverridablePropertyName.VARIANT) {
          continue;
        }

        let newKey: string;

        if (key === COMPUTED_OVERRIDE_DEFAULT_KEY) {
          newKey = context.currentScope;
        } else {
          newKey = key;
        }

        for (const variantId in override.value) {
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

  const translateUsedComponentOverrides = (
    instance: PCComponentInstanceElement | PCComponent,
    context: TranslateContext
  ) => {
    const contentNode =
      getPCNodeContentNode(instance.id, context.entry.content) || instance;
    const overrideMap = getOverrideMap(instance, contentNode);
    context = translateUsedComponentOverrideMap(
      mergeVariantOverrides(overrideMap),
      context
    );

    const variantSelectors = translateVariantSelectors(instance, overrideMap);

    if (Object.keys(variantSelectors).length) {
      context = addLine(
        `variantPrefixSelectors: ${JSON.stringify(variantSelectors)},`,
        context
      );
    }

    return context;
  };

  const translateUsedComponentOverrideMap = (
    map: PCComputedOverrideVariantMap,
    context: TranslateContext
  ) => {
    for (const key in map) {
      const { children, overrides } = map[key];
      if (mapContainsStaticOverrides(map[key])) {
        context = addOpenTag(`_${key}: {\n`, context);
        for (const override of overrides) {
          context = translateStaticOverride(override, context);
        }
        context = translateStaticStyleOverride(key, overrides, context, false);
        context = translateUsedComponentOverrideMap(children, context);
        context = addCloseTag(`},\n`, context);
      }
    }

    return context;
  };

  const translateStaticOverrides = (
    component: ContentNode,
    context: TranslateContext
  ) => {
    const visibleNodes = filterNestedNodes(
      component,
      (node) => isVisibleNode(node) || node.name === PCSourceTagNames.COMPONENT
    );
    for (const node of visibleNodes) {
      // overrides provided when component is created, so ski
      if (node.name === PCSourceTagNames.COMPONENT && extendsComponent(node)) {
        continue;
      }

      const overrideProp = `${
        node.name === PCSourceTagNames.COMPONENT
          ? "overrides"
          : `overrides._${node.id}`
      }`;

      if (node.name === PCSourceTagNames.COMPONENT_INSTANCE) {
        context = addOpenTag(`var _${node.id}StaticProps = {\n`, context);
      } else {
        context = addOpenTag(
          `var _${node.id}StaticProps = mergeProps({\n`,
          context
        );
      }
      if (
        node.name === PCSourceTagNames.ELEMENT ||
        node.name === PCSourceTagNames.COMPONENT ||
        node.name === PCSourceTagNames.COMPONENT_INSTANCE
      ) {
        context = translateInnerAttributes(node.id, node.attributes, context);
      }
      context = addLine(`key: "${node.id}",`, context);

      // class name provided in override
      if (node.name !== PCSourceTagNames.COMPONENT_INSTANCE) {
        context = translateStaticStyleOverride(
          node.id,
          getAllNodeOverrides(node.id, component),
          context
        );
      }

      if (node.name === PCSourceTagNames.TEXT) {
        context = addLine(`text: ${JSON.stringify(node.value)},`, context);
      }

      if (node.name === PCSourceTagNames.COMPONENT_INSTANCE) {
        context = addCloseTag(`};\n\n`, context);
      } else {
        context = addCloseTag(
          `}, ${overrideProp}, function(key) { return key.charAt(0) !== "_"; });\n\n`,
          context
        );
      }
    }
    return context;
  };

  const getAllNodeOverrides = (nodeId: string, contentNode: PCNode) => {
    const node = getNestedTreeNodeById(nodeId, contentNode) as PCNode;
    return (
      getTreeNodesByName(PCSourceTagNames.OVERRIDE, contentNode) as PCOverride[]
    ).filter((override) => {
      return (
        last(override.targetIdPath) === nodeId ||
        (override.targetIdPath.length === 0 &&
          node.children.indexOf(override) !== -1)
      );
    });
  };

  const translateControllers = (
    renderName: string,
    component: PCComponent,
    context: TranslateContext
  ) => {
    if (!component.controllers) {
      return context;
    }

    const internalVarName = getInternalVarName(component);

    let i = 0;

    for (const relativePath of component.controllers) {
      const controllerVarName = `${internalVarName}Controller${++i}`;

      // TODO - need to filter based on language (javascript). to be provided in context
      context = addLine(
        `var ${controllerVarName} = require("${relativePath}");`,
        context
      );
      context = addLine(
        `${renderName} = (${controllerVarName}.default || ${controllerVarName})(${translators
          .getControllerParameters(renderName)
          .join(", ")});`,
        context
      );
    }

    return context;
  };

  const translateContentNodeOverrides = (
    component: ContentNode,
    context: TranslateContext
  ) => {
    const instances = filterNestedNodes(
      component,
      (node) =>
        node.name === PCSourceTagNames.COMPONENT ||
        node.name === PCSourceTagNames.COMPONENT_INSTANCE
    ) as PCComponentInstanceElement[];

    for (let i = instances.length; i--; ) {
      const instance = instances[i];
      context = translateDynamicOverrides(component, instance, null, context);
      context = translatePlugs(component, instance, context);
    }

    return context;
  };

  const translateContentNodeVariantOverrides = (
    component: ContentNode,
    context: TranslateContext
  ) => {
    // const instances = filterNestedNodes(
    //   component,
    //   node =>
    //     node.name === PCSourceTagNames.COMPONENT ||
    //     node.name === PCSourceTagNames.COMPONENT_INSTANCE
    // );

    const variants = getPCVariants(component);
    for (const variant of variants) {
      context = addOpenTag(
        `if (variant.indexOf("${variant.id}") !== -1) {\n`,
        context
      );

      context = addLine(
        `_${context.currentScope}Props.${parts.classAttributeName} = (_${context.currentScope}Props.${parts.classAttributeName} ? _${context.currentScope}Props.${parts.classAttributeName} + " " : "") + "_${variant.id}";`,
        context
      );
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
      context = addCloseTag(`}\n`, context);
    }

    return context;
  };

  const isComputedOverride = (map: any): map is PCComputedNoverOverrideMap =>
    Boolean(map.children);

  const mapContainersOverride = (filter: (override: PCOverride) => boolean) => {
    const check = memoize(
      (map: PCComputedNoverOverrideMap | PCComputedOverrideVariantMap) => {
        if (isComputedOverride(map)) {
          if (map.overrides.find(filter)) {
            return true;
          }
          for (const childId in map.children) {
            if (check(map.children[childId])) {
              return true;
            }
          }
        } else {
          for (const childId in map) {
            if (check(map[childId])) {
              return true;
            }
          }
        }

        return false;
      }
    );
    return check;
  };

  const isStaticOverride = (override: PCOverride) =>
    override.propertyName !== PCOverridablePropertyName.CHILDREN &&
    !override.variantId;
  const isDynamicOverride = (override: PCOverride) =>
    (override.propertyName === PCOverridablePropertyName.CHILDREN &&
      override.children.length > 0) ||
    Boolean(override.variantId);

  const mapContainsStaticOverrides = mapContainersOverride(isStaticOverride);

  const defineNestedObject = (
    keyPath: string[],
    setObject: boolean,
    context: TranslateContext
  ) => {
    if (!context.definedObjects[context.currentScope]) {
      context = {
        ...context,
        definedObjects: {
          ...context.definedObjects,
          [context.currentScope]: {},
        },
      };
    }

    for (let i = 0, { length } = keyPath; i < length; i++) {
      const currentPath = keyPath.slice(0, i + 1);
      const ref = currentPath.join(".");
      if (!context.definedObjects[context.currentScope][ref]) {
        if (setObject) {
          context = addOpenTag(`if (${ref}) {\n`, context);
          context = addLine(`${ref} = Object.assign({}, ${ref});`, context);
          context = addCloseTag(`}`, context);
          context = addOpenTag(` else {\n`, context);
          context = addLine(`${ref} = {};`, context);
          context = addCloseTag(`}\n`, context);
        }
        context = {
          ...context,
          definedObjects: {
            ...context.definedObjects,
            [context.currentScope]: {
              ...context.definedObjects[context.currentScope],
              [ref]: true,
            },
          },
        };
      }
    }

    return context;
  };

  const translateDynamicOverrideKeys = (
    contentNode: ContentNode,
    context: TranslateContext
  ) => {
    const instances = filterNestedNodes(
      contentNode,
      (node) =>
        node.name === PCSourceTagNames.COMPONENT_INSTANCE ||
        node.name === PCSourceTagNames.COMPONENT
    );

    for (const instance of instances) {
      const overrides = getOverrides(instance);

      for (const override of overrides) {
        if (isDynamicOverride(override)) {
          let keyPath: string[];

          if (getNestedTreeNodeById(last(override.targetIdPath), contentNode)) {
            keyPath = [`_${last(override.targetIdPath)}Props`];
          } else {
            keyPath = [instance.id + "Props", ...override.targetIdPath].map(
              (id) => `_${id}`
            );
          }
          context = defineNestedObject(keyPath, true, context);
        }
      }
    }

    return context;
  };

  const translatePlugs = (
    component: ContentNode,
    instance: PCComponent | PCComponentInstanceElement,
    context: TranslateContext
  ) => {
    const plugs = (instance.children as PCNode[]).filter(
      (child) => child.name === PCSourceTagNames.PLUG
    ) as PCPlug[];

    for (const plug of plugs) {
      const visibleChildren = plug.children.filter(
        (child) => isVisibleNode(child) || child.name === PCSourceTagNames.SLOT
      ) as PCBaseElementChild[];

      const slot = getPCNode(plug.slotId, context.graph) as PCSlot;

      if (!slot) {
        console.log(`Orphaned plug found for slot ${plug.slotId}`);
        continue;
      }

      // context = addScopedLayerLabel(slot.label, slot.id, context);
      const publicLayerVarName =
        slot.label && makeSafeVarName(camelCase(slot.label));

      // We use the slot's name here so that developers can programatically override
      // the slot via controllers. This value should be unique, so if there's ever colliding slot names,
      // then there's an issue with the component file being translated.

      const slotPropName = publicLayerVarName || `_${slot.id}`;

      context = addOpenTag(
        `if (!_${instance.id}Props.${slotPropName}) {\n`,
        context
      );

      context = addOpenTag(
        `_${instance.id}Props.${slotPropName} = [\n`,
        context
      );
      for (const child of visibleChildren) {
        context = translateVisibleNode(child, context);
        context = addLineItem(",\n", context);
      }
      context = addCloseTag(`];\n`, context);
      context = addCloseTag(`}\n`, context);
    }

    return context;
  };

  const translateDynamicOverrides = (
    component: ContentNode,
    instance: PCComponent | PCComponentInstanceElement,
    variantId: string,
    context: TranslateContext
  ) => {
    const overrides = getOverrides(instance);

    for (const override of overrides) {
      if (isDynamicOverride(override) && override.variantId == variantId) {
        let keyPath: string[];

        if (getNestedTreeNodeById(last(override.targetIdPath), component)) {
          keyPath = [`_${last(override.targetIdPath)}Props`];
        } else {
          keyPath = [instance.id + "Props", ...override.targetIdPath].map(
            (id) => `_${id}`
          );
        }
        context = translateDynamicOverrideSetter(
          keyPath.join("."),
          override,
          context
        );
      }
    }

    return context;
  };

  const hasDynamicOverrides = ({
    children,
    overrides,
  }: PCComputedNoverOverrideMap) => {
    for (const override of overrides) {
      if (override.propertyName === PCOverridablePropertyName.CHILDREN) {
        return true;
      }
    }

    for (const key in children) {
      if (hasDynamicOverrides(children[key])) {
        return true;
      }
    }

    return false;
  };

  const translateDynamicOverrideSetter = (
    varName: string,
    override: PCOverride,
    context: TranslateContext
  ) => {
    if (override.variantId) {
      switch (override.propertyName) {
        case PCOverridablePropertyName.STYLE: {
          context = addLine(
            `${varName}.${parts.classAttributeName} = (${varName}.${parts.classAttributeName} ? ${varName}.${parts.classAttributeName} + " " : "") + "_${override.id} _${override.variantId}";`,
            context
          );
          return context;
        }
        case PCOverridablePropertyName.VARIANT: {
          context = addLine(
            `${varName}.variant = (${varName}.variant ? ${varName}.variant + " " : "") + "${Object.keys(
              override.value
            ).join(" ")}";`,
            context
          );
          return context;
        }
      }
    }

    return context;
  };

  const translateStaticOverride = (
    override: PCOverride,
    context: TranslateContext
  ) => {
    if (override.variantId) {
      return context;
    }

    switch (override.propertyName) {
      case PCOverridablePropertyName.TEXT: {
        return addLine(`text: ${JSON.stringify(override.value)},`, context);
      }
      case PCOverridablePropertyName.VARIANT: {
        return addLine(
          `variant: "${Object.keys(override.value).join(" ")}",`,
          context
        );
      }
      case PCOverridablePropertyName.ATTRIBUTES: {
        context = translateInnerAttributes(
          last(override.targetIdPath),
          override.value,
          context
        );
        break;
      }
    }

    return context;
  };

  const translateStaticStyleOverride = (
    nodeId: string,
    overrides: PCOverride[],
    context: TranslateContext,
    includeNodeId: boolean = true
  ) => {
    const styleOverrides = overrides.filter(
      (override) => override.propertyName === PCOverridablePropertyName.STYLE
    );
    if (!styleOverrides.length && !includeNodeId) {
      return context;
    }

    let nodeIds = styleOverrides.map((override) => override.id);
    if (includeNodeId) {
      nodeIds = [nodeId, ...nodeIds];
    }

    context = addLine(
      `"${parts.classAttributeName}": "${nodeIds
        .map((nodeId) => "_" + nodeId)
        .join(" ")}", `,
      context
    );

    return context;
  };

  const canTranslateAttributeKey = (key: string) =>
    !/xmlns/.test(key) &&
    key.indexOf(":") === -1 &&
    key !== "style" &&
    key !== "class";

  const translateInnerAttributes = (
    nodeId: string,
    attributes: any,
    context: TranslateContext
  ) => {
    const node = getPCNode(nodeId, context.graph) as PCComponentInstanceElement;
    if (!node) {
      return addWarning(new Error(`cannot find PC node`), context);
    }
    for (const key in attributes) {
      if (!canTranslateAttributeKey(key)) {
        continue;
      }
      let value = JSON.stringify(attributes[key]);
      if (key === "src" && node.is === "img") {
        value = `require(${value})`;
      }
      context = addLine(
        `${makeSafeVarName(camelCase(key))}: ${value},`,
        context
      );
    }
    return context;
  };

  const getNodePropsVarName = (
    node: PCVisibleNode | PCComponent,
    context: TranslateContext
  ) => {
    return node.name === PCSourceTagNames.COMPONENT
      ? `props`
      : `${getPublicLayerVarName(`${node.label} Props`, node.id, context)}`;
  };

  const hasStyle = (node: PCVisibleNode | PCComponent) => {
    return (
      Object.keys(node.style).length > 0 ||
      (node.styleMixins && Object.keys(node.styleMixins).length > 0)
    );
  };

  const translateVisibleNode = (node: PCNode, context: TranslateContext) => {
    switch (node.name) {
      case PCSourceTagNames.TEXT: {
        const textValue = `_${node.id}Props.text || ${JSON.stringify(
          node.value
        )}`;

        if (hasStyle(node)) {
          return addLineItem(
            `${parts.elementCreator}("span", _${node.id}Props, ${textValue})`,
            context
          );
        } else {
          return addLineItem(textValue, context);
        }
      }
      case PCSourceTagNames.COMPONENT_INSTANCE:
      case PCSourceTagNames.ELEMENT: {
        return translateElement(node, context);
      }
      case PCSourceTagNames.SLOT: {
        return translateSlot(node, context);
      }
    }

    return context;
  };

  const translateSlot = (slot: PCSlot, context: TranslateContext) => {
    const visibleChildren = slot.children.filter(
      (child) => isVisibleNode(child) || isSlot(child)
    );

    context = addScopedLayerLabel(slot.label, slot.id, context);

    const slotPropName = getPublicLayerVarName(slot.label, slot.id, context);

    if (slotPropName) {
      context = addLineItem(
        `_${context.currentScope}Props.${slotPropName} || `,
        context
      );
    }
    context = addLineItem(`_${context.currentScope}Props._${slot.id}`, context);

    if (visibleChildren.length) {
      context = addOpenTag(` || [\n`, context);
      context = visibleChildren.reduce((context, node, index, array) => {
        context = translateVisibleNode(node as any, context);
        if (index < array.length - 1) {
          context = addBuffer(",", context);
        }
        return addLine("", context);
      }, context);
      context = addCloseTag(`]`, context);
    }

    return context;
  };

  const translateElement = (
    elementOrComponent: PCComponent | PCComponentInstanceElement | PCElement,
    context: TranslateContext
  ) => {
    const visibleChildren = elementOrComponent.children.filter(
      (child) => isVisibleNode(child) || isSlot(child)
    );
    const hasVisibleChildren = visibleChildren.length > 0;
    context = addOpenTag(
      `${parts.elementCreator}(`,
      context,
      hasVisibleChildren
    );
    context = addLineItem(
      `${
        extendsComponent(elementOrComponent)
          ? `_${elementOrComponent.id}Component`
          : '"' + elementOrComponent.is + '"'
      }, `,
      context
    );

    if (!extendsComponent(elementOrComponent)) {
      context = addLineItem(
        `_toNativeProps(_${elementOrComponent.id}Props)`,
        context
      );
    } else {
      context = addLineItem(`_${elementOrComponent.id}Props`, context);
    }

    // TODO - deprecate child overrides like this
    context = addLineItem(`, _${elementOrComponent.id}Props.children`, context);
    if (visibleChildren.length) {
      context = addLineItem(` || [\n`, context);
      context = visibleChildren.reduce((context, node, index, array) => {
        context = translateVisibleNode(node as any, context);
        if (index < array.length - 1) {
          context = addBuffer(",", context);
        }
        return addLine("", context);
      }, context);
    } else if (hasVisibleChildren) {
      context = addLineItem("\n", context);
    }
    context = addCloseTag(
      hasVisibleChildren ? "])" : ")",
      context,
      hasVisibleChildren
    );
    return context;
  };

  return (
    entry: PCDependency,
    graph: DependencyGraph,
    rootDirectory: string,
    options: TranslateOptions = EMPTY_OBJECT
  ) =>
    translateModule(entry.content, {
      options,
      entry,
      buffer: "",
      graph,
      definedObjects: {},
      scopedLabelRefs: {},
      depth: 0,
      warnings: [],
      rootDirectory,
    });
};
