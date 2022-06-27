import { ProjectConfig } from "@tandem-ui/designer/lib/state";
import * as path from "path";
import * as fsa from "fs-extra";
import {
  Dependency,
  DependencyGraph,
  loadFSDependencyGraphSync,
  parseDocument,
  PCModule,
  serializeModule,
} from "@paperclip-lang/core";
import { mapValues } from "lodash";
import { deserializeModule } from "@paperclip-lang/core/lib/deserialize/deserialize";

export type UpgradeOptions = {
  projectFilePath: string;
};

export const upgradeProject = async ({ projectFilePath }: UpgradeOptions) => {
  const cwd = path.dirname(projectFilePath);
  const projectConfig: ProjectConfig = await loadConfig(projectFilePath);
  // const sourceDir = path.join(cwd, projectConfig.rootDir || ".");

  const oldDependencyGraph = loadFSDependencyGraphSync(
    projectConfig,
    cwd,
    (m) => m
  );

  const newDependencyGraph = translateDependencyGraph(oldDependencyGraph);

  for (const uri in newDependencyGraph) {
    console.log(`Serialize ${uri}`);
    console.log(newDependencyGraph[uri]);
  }

  sanityCheck(newDependencyGraph);

  // const pcFiles = await globby("**/*.pc", { cwd: sourceDir });
  // console.log(pcFiles);
};

const sanityCheck = (graph: Record<string, string>) => {
  // temporary sanity check about serializing
  const astGraph = mapValues(graph, (content, uri) => {
    try {
      return parseDocument(content);
    } catch (e) {
      console.error(`Failed to parse ${uri}`);
      throw e;
    }
  });
  mapValues(astGraph, (ast, uri) => {
    try {
      return deserializeModule(ast, uri, astGraph);
    } catch (e) {
      console.error(`Failed to serialize ${uri}`);
      throw e;
    }
  });
};

const pruneGraph = (graph: DependencyGraph) => {
  const newGraph: DependencyGraph = {};

  for (const url in graph) {
    if (graph[url].content.version) {
      newGraph[url] = graph[url];
    }
  }

  return newGraph;
};

const translateDependencyGraph = (graph: DependencyGraph) => {
  const prunedGraph = pruneGraph(graph);
  const newGraph: Record<string, string> = {};

  for (const filePath in prunedGraph) {
    newGraph[filePath] = translateDependency(
      prunedGraph[filePath],
      prunedGraph
    );
  }

  return newGraph;
};

const translateDependency = (
  { uri, content }: Dependency<PCModule>,
  graph: DependencyGraph
) => {
  return serializeModule(content, uri, graph);
};

const loadConfig = async (filePath: string): Promise<ProjectConfig> => {
  return JSON.parse(await fsa.readFile(filePath, "utf8"));
};
