import * as path from "path";
import * as fs from "fs";

import { init } from "./desktop";
import { TDProject } from "./desktop/state";
import { normalizeFilePath } from "tandem-common";

let projectPath = process.argv[2];
let project: TDProject;

if (projectPath) {
  projectPath =
    projectPath.charAt(0) !== "/"
      ? path.join(process.cwd(), projectPath)
      : projectPath;
  project = JSON.parse(fs.readFileSync(projectPath, "utf8"));
}

init({
  tdProjectPath: projectPath && normalizeFilePath(projectPath),
  tdProject: project,
  info: {},
});
