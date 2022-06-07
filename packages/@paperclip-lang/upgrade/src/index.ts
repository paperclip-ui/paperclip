import { ProjectConfig } from "@tandem-ui/designer/lib/state";
import * as path from "path";
import * as fsa from "fs-extra";
import * as globby from "globby";
import {
  Dependency,
  DependencyGraph,
  getDependents,
  getModuleComponents,
  loadFSDependencyGraphSync,
  PCModule,
} from "@paperclip-lang/core";
import { translateModule } from "./translate";

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

  // const pcFiles = await globby("**/*.pc", { cwd: sourceDir });
  // console.log(pcFiles);
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
  return translateModule(content, uri, graph);
};

const loadConfig = async (filePath: string): Promise<ProjectConfig> => {
  return JSON.parse(await fsa.readFile(filePath, "utf8"));
};
