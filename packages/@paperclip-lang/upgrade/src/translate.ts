import {
  DependencyGraph,
  getModuleComponents,
  getPCNode,
  getPCNodeDependency,
  isComponentOrInstance,
  isElementLikePCNode,
  isPCComponentInstance,
  isPCComponentOrInstance,
  isVisibleNode,
  PCComponent,
  PCComponentInstanceElement,
  PCElement,
  PCElementLikeNode,
  PCModule,
  PCNode,
  PCOverridablePropertyName,
  PCOverride,
  PCSlot,
  PCSourceTagNames,
  PCVariant,
  PCVisibleNode,
} from "@paperclip-lang/core";
import * as URL from "url";
import * as path from "path";
import { camelCase, over } from "lodash";
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
  context = translateComponents(context);
  console.log("translate", url);
  console.log(context.content);
  return context.content;
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
  context = addBuffer(`component ${pascalCase(component.label!)} {\n`, context);
  context = startBlock(context);
  context = translateComponentRender(component, context);
  context = endBlock(context);
  context = addBuffer("}\n\n", context);
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
    if (node.label && node.label !== "Element") {
      context = addBuffer(` ${camelCase(node.label)}`, context);
    }
    context = translateAttributes(node.attributes, context);
    context = translateChildren(node, context);
    context = addBuffer(`\n`, context);
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
      context = addBuffer(`slot ${camelCase(node.label)}\n`, context);
    }
  } else if (node.name === PCSourceTagNames.PLUG) {
    const slot = getPCNode(node.slotId, context.graph) as PCSlot;
    if (!slot) {
      return context;
    }
    context = addBuffer(`insert ${camelCase(slot.label)}`, context);
    context = translateChildren(node, context);
    context = addBuffer(`\n`, context);
    return context;
  }

  return context;
};

const translateStyle = (node: PCVisibleNode, context: TranslateContext) => {
  if (!hasStyles(node)) {
    return context;
  }
  context = addBuffer(`style {\n`, context);
  context = startBlock(context);
  for (const key in node.style) {
    context = addBuffer(`${key}: ${node.style[key]}\n`, context);
  }
  context = endBlock(context);
  context = addBuffer(`}\n`, context);
  return context;
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
  const overrides = getOverrides(node);
  const visibleChildren = node.children.filter(isNodeChild);

  if (!overrides.length && !visibleChildren.length && !hasStyles(node)) {
    return context;
  }

  context = addBuffer(` {\n`, context);
  context = startBlock(context);
  if (isVisibleNode(node)) {
    context = translateStyle(node, context);
  }
  context = translateOverrides(overrides, context);

  context = visibleChildren.reduce(
    (context, child) => translateNode(child, context),
    context
  );
  context = endBlock(context);
  context = addBuffer(`}`, context);

  return context;
};

const hasStyles = (node: PCNode) => {
  return (
    isVisibleNode(node) &&
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
    if (!overridesByPath[targetPath]) {
      overridesByPath[targetPath] = [];
    }
    overridesByPath[targetPath].push(override);
  }

  for (const targetPath in overridesByPath) {
    const overrides = overridesByPath[targetPath];
    context = addBuffer(`override`, context);
    if (targetPath) {
      context = addBuffer(` ${targetPath}`, context);
    }

    // value overrides first...
    for (const override of overrides) {
      if (override.propertyName === PCOverridablePropertyName.ATTRIBUTES) {
        context = translateAttributes(override.value, context);
        context = addBuffer(`\n`, context);
        continue;
      } else if (override.propertyName === PCOverridablePropertyName.TEXT) {
        context = addBuffer(` "${override.value}"\n`, context);
      }
    }

    const bodyOverrides = overrides.filter((override) => {
      if (override.propertyName === PCOverridablePropertyName.VARIANT) {
        return true;
      }
      return false;
    });

    const styleOverrides = overrides.filter((override) => {
      return override.propertyName === PCOverridablePropertyName.STYLE;
    });

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

      for (const override of styleOverrides) {
        console.log("OVERRR", override);
      }
      context = endBlock(context);
      context = addBuffer(`}\n`, context);
    }
  }
  return context;
};

const isNodeChild = (node: PCNode) =>
  isPCVisibleElement(node) ||
  node.name === PCSourceTagNames.TEXT ||
  node.name === PCSourceTagNames.SLOT ||
  node.name === PCSourceTagNames.PLUG;
const getOverrides = (node: PCNode) =>
  node.children.filter(
    (child) => child.name === PCSourceTagNames.OVERRIDE
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
      if (instanceDep && instanceDep.uri !== url) {
        importUrls.add(instanceDep.uri);
      }
    }
  }

  return Array.from(importUrls);
};
