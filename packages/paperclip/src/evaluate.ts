import { memoize, reuser, EMPTY_OBJECT, KeyValue, Bounds } from "tandem-common";
import {
  PCModule,
  getComponentGraphRefMap,
  PCSourceTagNames,
  getVariableRefMap,
  PCVisibleNode,
  PCVisibleNodeMetadataKey,
  getQueryRefMap
} from "./dsl";
import {
  compileContentNodeAsVanilla,
  VanillaPCRenderers,
  WindowInfo
} from "./vanilla-compiler";
import { DependencyGraph } from "./graph";
import { createSytheticDocument, SyntheticDocument } from "./synthetic";

const reuseNodeGraphMap = reuser(500, (value: KeyValue<any>) =>
  Object.keys(value).join(",")
);

export const evaluateDependencyGraph = (
  graph: DependencyGraph,
  rootDirectory: string,
  variants: KeyValue<KeyValue<boolean>>,
  uriWhitelist?: string[]
): KeyValue<SyntheticDocument> => {
  const documents = {};
  const renderers = compileDependencyGraph(graph, rootDirectory);
  for (const uri in graph) {
    if (uriWhitelist && uriWhitelist.indexOf(uri) === -1) {
      continue;
    }
    const { content: module } = graph[uri];
    documents[uri] = evaluateModule(
      module,
      variants,
      reuseNodeGraphMap(filterAssocRenderers(module, graph, renderers))
    );
  }

  return documents;
};

const evaluateModule = memoize(
  (
    module: PCModule,
    variants: KeyValue<KeyValue<boolean>>,
    usedRenderers: VanillaPCRenderers
  ) => {
    return createSytheticDocument(
      module.id,
      module.children
        .filter(
          child =>
            child.name !== PCSourceTagNames.VARIABLE &&
            child.name !== PCSourceTagNames.QUERY
        )
        .map(child => {
          return usedRenderers[`_${child.id}`](
            child.id,
            null,
            EMPTY_OBJECT,
            EMPTY_OBJECT,
            variants[child.id] || EMPTY_OBJECT,
            EMPTY_OBJECT,
            getWindowInfo(child as PCVisibleNode),
            usedRenderers,
            true
          );
        })
    );
  }
);

const getWindowInfo = (contentNode: PCVisibleNode): WindowInfo => {
  const bounds: Bounds = contentNode.metadata[PCVisibleNodeMetadataKey.BOUNDS];
  return {
    width: Math.round(bounds.right - bounds.left),
    height: Math.round(bounds.bottom - bounds.top)
  };
};

const filterAssocRenderers = (
  module: PCModule,
  graph: DependencyGraph,
  allRenderers: VanillaPCRenderers
) => {
  const assocRenderers: VanillaPCRenderers = {};
  const refMap = getComponentGraphRefMap(module, graph);
  for (const id in refMap) {
    assocRenderers[`_${id}`] = allRenderers[`_${id}`];
  }

  for (const child of module.children) {
    assocRenderers[`_${child.id}`] = allRenderers[`_${child.id}`];
  }
  return assocRenderers;
};

const compileDependencyGraph = memoize(
  (graph: DependencyGraph, rootDirectory: string) => {
    const renderers = {};
    for (const uri in graph) {
      const { content: module } = graph[uri];
      for (const contentNode of module.children) {
        renderers[`_${contentNode.id}`] = compileContentNodeAsVanilla(
          contentNode,
          reuseNodeGraphMap(getComponentGraphRefMap(contentNode, graph)),
          reuseNodeGraphMap(getVariableRefMap(contentNode, graph)),
          reuseNodeGraphMap(getQueryRefMap(contentNode, graph)),
          uri,
          rootDirectory
        );
      }
    }
    return renderers;
  }
);
