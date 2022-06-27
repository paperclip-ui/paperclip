import { FileCache } from "fsbox";
import { mapValues } from "lodash";
import { memoize } from "tandem-common";
import { createPCModule } from "./dsl";
import { serializeModule } from "./serialize";
import { parseDocument } from "./parser/dsl/parser";
import { deserializeModule } from "./deserialize/deserialize";

/*------------------------------------------
 * TYPES
 *-----------------------------------------*/

export type DependencyGraph = {
  [identifier: string]: Dependency<any>;
};

export type Dependency<TContent> = {
  // URI used here since it could be a url
  uri: string;

  content: TContent;
};

/*------------------------------------------
 * GETTERS
 *-----------------------------------------*/

export const getDependents = memoize((uri: string, graph: DependencyGraph) => {
  const dependents = [];

  for (const depUri in graph) {
    if (depUri === uri) {
      continue;
    }

    const dep = graph[depUri];
  }

  return dependents;
});

export const updateGraphDependency = (
  properties: Partial<Dependency<any>>,
  uri: string,
  graph: DependencyGraph
) => ({
  ...graph,
  [uri]: {
    ...graph[uri],
    ...properties,
  },
});

export const getModifiedDependencies = (
  newGraph: DependencyGraph,
  oldGraph: DependencyGraph
) => {
  const modified: Dependency<any>[] = [];
  for (const uri in oldGraph) {
    if (newGraph[uri] && newGraph[uri].content !== oldGraph[uri].content) {
      modified.push(newGraph[uri]);
    }
  }
  return modified;
};

export const isPaperclipUri = (uri: string) => {
  return /\.pc$/.test(uri);
};

const createDependencyFromFileCacheItem = memoize(
  ({ uri, content }: { uri: string; content: Buffer }): Dependency<any> => {
    const source = new TextDecoder("utf-8").decode(content);
    return {
      uri,

      // if an empty string, then it's a new file.
      content: source.trim() === "" ? createPCModule() : JSON.parse(source),
    };
  }
);

export const addFileCacheItemToDependencyGraph = (
  item: { uri: string; content: Buffer },
  graph: DependencyGraph = {}
): DependencyGraph => {
  return {
    ...graph,
    [item.uri]: createDependencyFromFileCacheItem(item),
  };
};

export const deserializeDependencyGraph = (
  cache: FileCache
): DependencyGraph => {
  // The logic here is all temporary until the serializer + deserializer stabilizes. Once that happens,
  // the only thing that should be here is the deserializer.

  // TODO: delete me after things stabilize
  const dslGraph = mapValues(cache, (fileItem) => {
    try {
      return JSON.parse(fileItem.content.toString("utf-8"));
    } catch (e) {
      return createPCModule();
    }
  });

  const astGraph = mapValues(dslGraph, (module, url) => {
    // TODO - assume module is text source
    return parseDocument(serializeModule(module, url, dslGraph));
  });

  const dslGraph2 = mapValues(astGraph, (doc, uri) => {
    return {
      uri,
      content: deserializeModule(doc, uri, astGraph),
    };
  });

  return dslGraph2;
};

/*------------------------------------------
 * SETTERS
 *-----------------------------------------*/
