import {
  DependencyGraph,
  getPCNode,
  getPCNodeDependency,
  isComponentOrInstance,
  PCModule,
  PCNode,
  PCSourceTagNames,
} from "@paperclip-lang/core";
import { getNestedTreeNodeById, getTreeNodeIdMap } from "tandem-common";
import { TranslateContext } from "./translate-context";

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
  };
  context = translateImports(context);
  return context.content;
};

const translateImports = (context: TranslateContext) => {
  const nodes = Object.values(getTreeNodeIdMap(context.module)) as PCNode[];
  const importUrls: Set<string> = new Set();
  // console.log("TRANSLATE IMPORTS", context.url);
  for (const node of nodes) {
    const dep = getPCNodeDependency(node.id, context.graph);

    if (node.name === PCSourceTagNames.COMPONENT_INSTANCE) {
      try {
        console.log(node.is);
        const instanceDep = getPCNodeDependency(node.is, context.graph);
        if (instanceDep.uri !== context.url) {
          importUrls.add(dep.uri);
        }
      } catch (e) {}
    }

    if (dep.uri !== context.url) {
      importUrls.add(dep.uri);
    }
  }
  console.log(importUrls);
  // console.log(importUrls)
  // console.log(nodes);
  return context;
};
