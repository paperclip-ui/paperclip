import { ProjectConfig } from "@tandem-ui/designer/lib/state";
import * as path from "path";
import * as fsa from "fs-extra";
import * as globby from "globby";
import { loadFSDependencyGraphSync } from "@paperclip-lang/core";

export type UpgradeOptions = {
  projectFilePath: string;
};

export const upgradeProject = async ({ projectFilePath }: UpgradeOptions) => {
  const cwd = path.dirname(projectFilePath);
  const projectConfig: ProjectConfig = await loadConfig(projectFilePath);
  // const sourceDir = path.join(cwd, projectConfig.rootDir || ".");

  const dependencyGraph = loadFSDependencyGraphSync(
    projectConfig,
    cwd,
    (m) => m
  );
  console.log(dependencyGraph);

  // const pcFiles = await globby("**/*.pc", { cwd: sourceDir });
  // console.log(pcFiles);
};

const loadConfig = async (filePath: string): Promise<ProjectConfig> => {
  return JSON.parse(await fsa.readFile(filePath, "utf8"));
};
