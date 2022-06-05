/**
TODOS:

- better error messaging for files that are not found
*/

import { EMPTY_OBJECT } from "tandem-common";
import * as migratePCModule from "paperclip-migrator";
import { createPCModule, PCModule } from "./dsl";
import { Dependency, DependencyGraph } from "./graph";
export type FileLoader = (uri: string) => string | Promise<string>;

export type LoadEntryOptions = {
  openFile: FileLoader;
  graph?: DependencyGraph;
};

export type LoadEntryResult = {
  entry: Dependency<any>;
  graph: DependencyGraph;
};

export const loadEntry = async (
  entryFileUri: string,
  options: LoadEntryOptions
): Promise<LoadEntryResult> => {
  const graph: DependencyGraph = { ...(options.graph || EMPTY_OBJECT) };
  const queue: string[] = [entryFileUri];
  while (queue.length) {
    const currentUri = queue.shift();
    if (graph[currentUri]) {
      continue;
    }

    const module = await loadModule(currentUri, options);

    const dependency = createDependency(currentUri, module);
    graph[currentUri] = dependency;
  }

  return {
    entry: graph[entryFileUri],
    graph,
  };
};

const createDependency = (uri: string, content: PCModule): Dependency<any> => ({
  uri,
  content,
});

const parseNodeSource = (source: string) => {
  return JSON.parse(source);
};

const loadModule = async (
  uri: string,
  options: LoadEntryOptions
): Promise<PCModule> => {
  const content = await options.openFile(uri);

  if (!content) {
    return createPCModule();
  }

  // TODO - support other extensions in the future like images
  if (/xml$/.test(uri)) {
    // TODO - transform XML to JSON
    throw new Error(`XML is not supported yet`);
  } else if (/pc$/.test(uri)) {
    try {
      let source = parseNodeSource(content);
      return migratePCModule(source);
    } catch (e) {
      console.warn(e);
      return createPCModule();
    }
  } else if (!/json$/.test(uri)) {
    throw new Error(`Unsupported import ${uri}.`);
  } else {
    return JSON.parse(content);
  }
};
