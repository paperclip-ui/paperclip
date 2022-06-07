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

const translateDependencyGraph = (graph: DependencyGraph) => {
  const newGraph: Record<string, string> = {};
  for (const filePath in graph) {
    console.log(filePath);

    // invalid, just delete. This is blah but w/e
    if (!graph[filePath].content.version) {
      delete graph[filePath];
      continue;
    }

    newGraph[filePath] = translateDependency(graph[filePath], graph);
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
