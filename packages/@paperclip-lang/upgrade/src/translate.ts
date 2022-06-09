import {
  DependencyGraph,
  getModuleComponents,
  getOverrideMap,
  getPCNode,
  getPCNodeContentNode,
  getPCNodeDependency,
  getPCNodeModule,
  getPCVariants,
  isComponentOrInstance,
  isElementLikePCNode,
  isPCComponentInstance,
  isPCComponentOrInstance,
  isVisibleNode,
  PCComponent,
  PCComponentInstanceElement,
  PCElement,
  PCElementLikeNode,
  PCMediaQuery,
  PCModule,
  PCNode,
  PCOverridablePropertyName,
  PCOverride,
  PCQueryType,
  PCSlot,
  PCSourceTagNames,
  PCStyleMixin,
  PCStyleOverride,
  PCVariable,
  PCVariant,
  PCVisibleNode,
} from "@paperclip-lang/core";
import * as URL from "url";
import * as path from "path";
import { camelCase, isEqual, over, uniq } from "lodash";
import {
  EMPTY_OBJECT,
  getNestedTreeNodeById,
  getTreeNodeIdMap,
  Translate,
} from "tandem-common";
import {
  addBuffer,
  endBlock,
  startBlock,
  TranslateContext,
} from "./translate-context";
import { pascalCase } from "./utils";

type PCElementLike = PCComponent | PCComponentInstanceElement | PCElement;

export const translateModule = (
  module: PCModule,
  url: string,
  graph: DependencyGraph
) => {
  let context: TranslateContext = {
    graph,
    module,
    url,
    content: "",
    blockCount: 0,
    indent: "  ",
    importedUrls: getImportedUrls(module, url, graph),
  };
  context = translateImports(context);
  context = translateStyleVars(context);
  context = translateComponents(context);
  console.log("translate", url);
  console.log(context.content);
  return context.content;
};

const translateStyleVars = (context: TranslateContext) => {
  for (const contentNode of context.module.children) {
    if (contentNode.name === PCSourceTagNames.VARIABLE) {
      context = translateStyleVar(contentNode as PCVariable, context);
    } else if (contentNode.name === PCSourceTagNames.STYLE_MIXIN) {
      context = translateStyleMixin(contentNode as PCStyleMixin, context);
    } else if (contentNode.name === PCSourceTagNames.QUERY) {
      context = translateMediaQuery(contentNode as PCMediaQuery, context);
    }
  }
  return context;
};

const translateStyleVar = (node: PCVariable, context: TranslateContext) => {
  if (node.value) {
    context = addBuffer(
      `export string ${camelCase(node.label)} "${node.value}"\n`,
      context
    );
  }

  return context;
};

const translateStyleMixin = (node: PCStyleMixin, context: TranslateContext) => {
  context = addBuffer(`export style ${camelCase(node.label)} {\n`, context);
  context = startBlock(context);
  context = translateStyleValues(node.style, context);
  context = endBlock(context);
  context = addBuffer(`}\n\n`, context);
  return context;
};

const translateMediaQuery = (node: PCMediaQuery, context: TranslateContext) => {
  if (node.type === PCQueryType.MEDIA) {
    context = addBuffer(
      `export trigger ${camelCase(node.label)} media screen and (min-width: ${
        node.condition.minWidth || 0
      }, max-width: ${node.condition.maxWidth})\n`,
      context
    );
  }

  return context;
};

const translateComponents = (context: TranslateContext) => {
  const components = getModuleComponents(context.module);
  for (const component of components) {
    context = translateComponent(component, context);
  }
  return context;
};

const translateComponent = (
  component: PCComponent,
  context: TranslateContext
) => {
  context = translateMetadata(component, context);
  context = addBuffer(
    `export component ${pascalCase(component.label!)} {\n`,
    context
  );
  if (pascalCase(component.label!) === "Welcome") {
    console.log(JSON.stringify(component, null, 2));
  }
  context = startBlock(context);
  context = translateVariants(component, context);
  context = translateComponentRender(component, context);
  context = endBlock(context);
  context = addBuffer("}\n\n", context);
  return context;
};

const translateMetadata = (node: PCNode, context: TranslateContext) => {
  for (const key in node.metadata) {
    context = addBuffer(`@${key}(`, context);
    const value = node.metadata[key];
    const keys = Object.keys(value);
    for (let i = 0, { length } = keys; i < length; i++) {
      const key = keys[i];
      context = addBuffer(
        `${key}: ${
          typeof value[key] === "number" ? Math.round(value[key]) : value[key]
        }`,
        context
      );
      if (i < length - 1) {
        context = addBuffer(`, `, context);
      }
    }
    context = addBuffer(`)\n`, context);
  }
  return context;
};

const translateVariants = (
  component: PCComponent,
  context: TranslateContext
) => {
  const variants = getPCVariants(component);
  for (const variant of variants) {
    context = addBuffer(
      `variant ${camelCase(variant.label)} (on: ${
        variant.isDefault === true
      })\n`,
      context
    );
  }
  return context;
};

const translateComponentRender = (
  component: PCComponent,
  context: TranslateContext
) => {
  context = addBuffer(`render `, context);
  context = translateNode(component, context);
  return context;
};

const translateNode = (node: PCNode, context: TranslateContext) => {
  if (isPCVisibleElement(node)) {
    context = addBuffer(getRef(node, context), context);
    if (
      node.label &&
      node.label !== "Element" &&
      node.name !== PCSourceTagNames.COMPONENT
    ) {
      context = addBuffer(` ${camelCase(node.label)}`, context);
    }
    context = translateAttributes(node.attributes, context);
    context = translateChildren(node, context);
  } else if (node.name === PCSourceTagNames.TEXT) {
    context = addBuffer(`text`, context);
    if (node.label && node.label !== "Text") {
      context = addBuffer(` ${camelCase(node.label)}`, context);
    }
    context = addBuffer(
      ` "${node.value.replace(/"/g, '\\"').trim()}"\n`,
      context
    );
  } else if (node.name === PCSourceTagNames.SLOT) {
    if (node.label) {
      context = addBuffer(`slot ${camelCase(node.label)}`, context);
      if (node.children.length) {
        context = translateChildren(node, context);
      } else {
        context = addBuffer(`\n`, context);
      }
    }
  } else if (node.name === PCSourceTagNames.PLUG) {
    const slot = getPCNode(node.slotId, context.graph) as PCSlot;
    if (!slot) {
      return context;
    }
    context = addBuffer(`insert ${camelCase(slot.label)}`, context);
    context = translateChildren(node, context);
    return context;
  }

  return context;
};

/*

*/

const translateStyle = (
  node: PCVisibleNode | PCComponent | PCComponentInstanceElement,
  context: TranslateContext
) => {
  const styleOverrides = getVariantStyleOverrides(node, context);

  if (!hasStyles(node) && !styleOverrides.length) {
    return context;
  }

  if (isPCComponentInstance(node)) {
    context = addBuffer(`override {\n`, context);
    context = startBlock(context);
  }
  context = addBuffer(`style {\n`, context);
  context = startBlock(context);
  for (const key in node.style) {
    context = addBuffer(
      `${key}: ${translateStyleValue(node.style[key], context)}\n`,
      context
    );
  }
  context = translateStyleOverridesInner(styleOverrides, context);
  context = endBlock(context);
  context = addBuffer(`}\n`, context);
  if (isPCComponentInstance(node)) {
    context = endBlock(context);
    context = addBuffer(`}\n`, context);
  }
  return context;
};

const translateStyleOverridesInner = (
  styleOverrides: PCStyleOverride[],
  context: TranslateContext
) => {
  for (const override of styleOverrides) {
    const variant =
      override.variantId &&
      (getPCNode(override.variantId, context.graph) as PCVariant);
    if (variant) {
      context = addBuffer(`if ${camelCase(variant.label)} {\n`, context);
      context = startBlock(context);
    }
    context = translateStyleValues(override.value, context);
    if (variant) {
      context = endBlock(context);
      context = addBuffer(`}\n`, context);
    }
  }
  return context;
};

const translateStyleValues = (
  style: Record<string, string>,
  context: TranslateContext
) => {
  for (const key in style) {
    context = addBuffer(
      `${key}: ${translateStyleValue(String(style[key]), context)}\n`,
      context
    );
  }
  return context;
};

const getVarId = (value: string) => {
  if (String(value).includes("var(")) {
    const varId = value.match(/var\(--(.*?)\)/)[1];
    return varId;
  }

  return null;
};

const translateStyleValue = (value: string, context: TranslateContext) => {
  const varId = getVarId(value);

  if (varId) {
    const vr = getPCNode(varId, context.graph) as PCVariable;
    if (!vr) {
      return value;
    }

    let varName = camelCase(vr.label);
    const dep = getPCNodeDependency(varId, context.graph);
    if (dep.uri !== context.url) {
      varName = `imp${context.importedUrls.indexOf(dep.uri)}.${varName}`;
    }

    value = value.replace(/var\(.*?\)/g, `#{${varName}}`);
  }
  return value;
};

const getVariantStyleOverrides = (node: PCNode, context: TranslateContext) => {
  const module = getPCNodeModule(node.id, context.graph);
  const contentNode = getPCNodeContentNode(node.id, module);

  const overrides = uniq([
    ...getOverrides(node, context.graph),
    ...getOverrides(contentNode, context.graph),
  ]).filter(
    (override) =>
      override.propertyName === PCOverridablePropertyName.STYLE &&
      (override.targetIdPath.length === 0 ||
        (override.targetIdPath.length === 1 &&
          override.targetIdPath[0] === node.id))
  );
  return overrides as PCStyleOverride[];
};

const translateAttributes = (
  attributes: Record<string, string>,
  context: TranslateContext
) => {
  const attrNames = Object.keys(attributes).filter(
    (name) => !name.includes(":") && name !== "xmlns"
  );
  if (!attrNames.length) {
    return context;
  }
  context = addBuffer(` (`, context);
  for (let i = 0, { length } = attrNames; i < length; i++) {
    const name = attrNames[i];
    const value = attributes[name];
    context = addBuffer(`${name}: "${value}"`, context);
    if (i < length - 1) {
      context = addBuffer(`, `, context);
    }
  }
  context = addBuffer(`)`, context);

  return context;
};

const translateChildren = (node: PCNode, context: TranslateContext) => {
  const overrides = getOverrides(node, context.graph);
  const visibleChildren = node.children.filter(isNodeChild);

  if (!overrides.length && !visibleChildren.length && !hasStyles(node)) {
    return addBuffer("\n", context);
  }

  context = addBuffer(` {\n`, context);
  context = startBlock(context);
  if (isVisibleNode(node) || isPCComponentOrInstance(node)) {
    context = translateStyle(node, context);
  }

  if (isPCComponentInstance(node)) {
    context = translateOverrides(overrides, context);
  }

  context = visibleChildren.reduce(
    (context, child) => translateNode(child, context),
    context
  );
  context = endBlock(context);
  context = addBuffer(`}\n`, context);

  return context;
};

const hasStyles = (node: PCNode) => {
  return (
    (isVisibleNode(node) || isPCComponentOrInstance(node)) &&
    (Object.keys(node.style).length > 0 ||
      Object.keys(node.styleMixins || EMPTY_OBJECT).length > 0)
  );
};

const translateOverrides = (
  overrides: PCOverride[],
  context: TranslateContext
) => {
  const overridesByPath: Record<string, PCOverride[]> = {};

  for (const override of overrides) {
    const targetPath = override.targetIdPath
      .map((idPath) => {
        const node = getPCNode(idPath, context.graph) as PCVisibleNode;
        if (!node) {
          return null;
        }
        return camelCase(node.label);
      })
      .filter(Boolean)
      .join(".");

    // skip overrides taht are on the instance itself
    if (
      override.propertyName === PCOverridablePropertyName.STYLE &&
      override.targetIdPath.length < 2
    ) {
      continue;
    }

    if (!overridesByPath[targetPath]) {
      overridesByPath[targetPath] = [];
    }
    overridesByPath[targetPath].push(override);
  }

  for (const targetPath in overridesByPath) {
    const overrides = overridesByPath[targetPath];

    const valueOverride = overrides.find(
      (override) =>
        override.propertyName === PCOverridablePropertyName.ATTRIBUTES ||
        override.propertyName === PCOverridablePropertyName.TEXT
    );
    const bodyOverrides = overrides.filter((override) => {
      if (override.propertyName === PCOverridablePropertyName.VARIANT) {
        return true;
      }
      return false;
    });

    const styleOverrides = overrides.filter((override) => {
      return (
        override.propertyName === PCOverridablePropertyName.STYLE &&
        override.targetIdPath.length > 1
      );
    });

    if (!valueOverride && !bodyOverrides.length && !styleOverrides.length) {
      continue;
    }

    context = addBuffer(`override`, context);
    if (targetPath) {
      context = addBuffer(` ${targetPath}`, context);
    }

    if (valueOverride) {
      if (valueOverride.propertyName === PCOverridablePropertyName.ATTRIBUTES) {
        context = translateAttributes(valueOverride.value, context);
        context = addBuffer(`\n`, context);
      } else if (
        valueOverride.propertyName === PCOverridablePropertyName.TEXT
      ) {
        context = addBuffer(` "${valueOverride.value.trim()}"\n`, context);
      }
    }

    if (bodyOverrides.length || styleOverrides.length) {
      context = addBuffer(` {\n`, context);
      context = startBlock(context);
      for (const override of bodyOverrides) {
        if (override.propertyName === PCOverridablePropertyName.VARIANT) {
          for (const variantId in override.value) {
            const variant = getPCNode(variantId, context.graph) as PCVariant;
            if (variant) {
              const enabled = override.value[variantId];
              context = addBuffer(
                `variant ${camelCase(variant.label)} (on: ${enabled})\n`,
                context
              );
            }
          }
        }
      }

      context = endBlock(context);
      context = addBuffer(`}\n`, context);
    } else {
      context = addBuffer(`\n`, context);
    }
  }
  return context;
};

const isNodeChild = (node: PCNode) =>
  isPCVisibleElement(node) ||
  node.name === PCSourceTagNames.TEXT ||
  node.name === PCSourceTagNames.SLOT ||
  node.name === PCSourceTagNames.PLUG;

const getOverrides = (node: PCNode, graph: DependencyGraph) =>
  node.children.filter(
    (child) =>
      child.name === PCSourceTagNames.OVERRIDE &&
      (child as PCOverride).targetIdPath.every((idPath) =>
        getPCNode(idPath, graph)
      )
  ) as PCOverride[];

const isPCVisibleElement = (
  node: PCNode
): node is PCComponent | PCComponentInstanceElement | PCElement => {
  return (
    isPCComponentOrInstance(node) || node.name === PCSourceTagNames.ELEMENT
  );
};

const getRef = (node: PCElementLike, context: TranslateContext) => {
  if (isPCComponentOrInstance(node)) {
    const component = getPCNode(node.is, context.graph) as PCComponent;
    if (component) {
      const origin = getPCNodeDependency(component.id, context.graph);
      if (origin.uri !== context.url) {
        return `imp${context.importedUrls.indexOf(origin.uri)}.${pascalCase(
          component.label!
        )}`;
      } else {
        return `${pascalCase(component.label!)}`;
      }
    }
  }

  return node.is;
};

const translateImports = (context: TranslateContext) => {
  const filePath = URL.fileURLToPath(context.url);
  const importUrls = context.importedUrls;

  for (const url of importUrls) {
    let relativePath = path.relative(
      path.dirname(filePath),
      URL.fileURLToPath(url)
    );
    if (relativePath.charAt(0) !== ".") {
      relativePath = "./" + relativePath;
    }

    context = addBuffer(
      `import "${relativePath}" as imp${importUrls.indexOf(url)}\n`,
      context
    );
  }

  context = addBuffer("\n\n", context);

  return context;
};

const getImportedUrls = (
  module: PCModule,
  url: string,
  graph: DependencyGraph
) => {
  const nodes = Object.values(getTreeNodeIdMap(module)) as PCNode[];
  const importUrls: Set<string> = new Set();

  for (const node of nodes) {
    if (isPCComponentOrInstance(node)) {
      const instanceDep = getPCNodeDependency(node.is, graph);
      if (instanceDep) {
        importUrls.add(instanceDep.uri);
      }
    }
    if (
      node.name === PCSourceTagNames.OVERRIDE &&
      node.propertyName === PCOverridablePropertyName.STYLE
    ) {
      for (const key in node.value) {
        const varId = getVarId(node.value[key]);
        const dep = getPCNodeDependency(varId, graph);
        if (dep) {
          importUrls.add(dep.uri);
        }
      }
    }

    if (isVisibleNode(node) || isPCComponentInstance(node)) {
      for (const key in node.style) {
        const varId = getVarId(node.style[key]);
        const dep = getPCNodeDependency(varId, graph);
        if (dep) {
          importUrls.add(dep.uri);
        }
      }
    }
  }

  importUrls.delete(url);

  return Array.from(importUrls);
};
