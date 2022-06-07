import {
  DependencyGraph,
  getModuleComponents,
  getPCNode,
  getPCNodeDependency,
  isComponentOrInstance,
  isElementLikePCNode,
  isPCComponentInstance,
  isPCComponentOrInstance,
  PCComponent,
  PCComponentInstanceElement,
  PCElement,
  PCElementLikeNode,
  PCModule,
  PCNode,
  PCSlot,
  PCSourceTagNames,
} from "@paperclip-lang/core";
import * as URL from "url";
import * as path from "path";
import { camelCase } from "lodash";
import { getNestedTreeNodeById, getTreeNodeIdMap } from "tandem-common";
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
    if (Object.keys(node.attributes).length) {
      for (const key in node.attributes) {
      }
    }

    if (node.label) {
      context = addBuffer(` ${camelCase(node.label)}`, context);
    }

    if (node.children) {
      context = addBuffer(` {\n`, context);
      context = startBlock(context);
      context = node.children.reduce(
        (context, child) => translateNode(child, context),
        context
      );
      context = endBlock(context);
      context = addBuffer(`}`, context);
    }
    context = addBuffer(`\n`, context);
  } else if (node.name === PCSourceTagNames.TEXT) {
    context = addBuffer(
      `text "${node.value.replace(/"/g, '\\"').trim()}"\n`,
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
    return context;
  } else {
    console.log(node);
  }

  return context;
};

const translateChildren = (node: PCNode, context: TranslateContext) => {
  context = addBuffer(` {\n`, context);
  context = startBlock(context);
  context = node.children.reduce(
    (context, child) => translateNode(child, context),
    context
  );
  context = endBlock(context);
  context = addBuffer(`}`, context);

  return context;
};

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
  const nodes = Object.values(getTreeNodeIdMap(context.module)) as PCNode[];
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
    // const dep = getPCNodeDependency(node.id, graph);

    if (isPCComponentOrInstance(node)) {
      const instanceDep = getPCNodeDependency(node.is, graph);
      if (instanceDep && instanceDep.uri !== url) {
        importUrls.add(instanceDep.uri);
      }
    }
  }

  return Array.from(importUrls);
};
