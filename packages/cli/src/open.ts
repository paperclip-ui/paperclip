import * as path from "path";
import * as fs from "fs";
import chalk from "chalk";
import { platform } from "os";
import { spawn } from "child_process";
import { DEFAULT_PROJECT_FILE_NAME, TMP_APP_BIN_PATH } from "./constants";
import { start as install } from "./install";

const isWin = platform() === "win32";

export const start = (cwd: string) => async () => {
  await install(cwd)({ force: false });

  const projectFileName = DEFAULT_PROJECT_FILE_NAME;
  const projectFilePath = path
    .join(cwd, projectFileName)
    .replace("C:\\", "/")
    .replace(/\\/g, "/");
  if (!fs.existsSync(projectFilePath)) {
    return console.error(
      chalk.red(
        `No project found. You can create one by running "${chalk.bold(
          "tandem init"
        )}".`
      )
    );
  }

  if (isWin) {
    const proc = spawn(
      TMP_APP_BIN_PATH,
      ["filler-this-doesnt-really-matter-here", projectFilePath],
      {
        cwd: cwd,
        env: process.env
      }
    );
  } else {
    const proc = spawn(
      `open`,
      [
        TMP_APP_BIN_PATH,
        "--args",
        "filler-this-doesnt-really-matter-here",
        projectFilePath
      ],
      {
        cwd: cwd,
        env: process.env
      }
    );
  }

  // TODO - look for binary
};
