import * as inquirer from "inquirer";
import chalk from "chalk";
import * as path from "path";
import * as fs from "fs";
import { createProjectFiles, templates } from "tandem-starter-kits";
import { DEFAULT_PROJECT_FILE_NAME, PROJECT_FILE_EXTENSION } from "./constants";

/*

- Where would you like UI files to be stored? src
- Where's your modules directory? node_modules
- Create *.tdproject
- stdout: 
  - You can now open tandem by running `tandem open`
  - Link docs for configuring build 

*/

export const start = cwd => async argv => {
  const defaultFilePath = path.join(cwd, DEFAULT_PROJECT_FILE_NAME);
  if (fs.existsSync(defaultFilePath)) {
    console.warn(
      chalk.yellow("A Tandem project already exists in this directory.")
    );
    return;
  }
  const config = await setupConfig();
  fs.writeFileSync(defaultFilePath, JSON.stringify(config, null, 2));
  console.log(`Created ${defaultFilePath}`);
  console.log("");
  console.log(
    `Config docs for ${path.basename(
      defaultFilePath
    )} can be found at ${chalk.underline(
      "https://github.com/tandemcode/tandem/blob/master/docs/app-config.md"
    )}`
  );

  console.log("");
  console.log(
    chalk.white.bold("You can now run"),
    chalk.bold.blue("tandem open")
  );
  console.log("");
};

const setupConfig = async () => {
  // const {rootDir} = await inquirer.prompt<any>([
  //   {
  //     type: "input",
  //     name: "rootDir",
  //     message: "What's the root directory of your project?",
  //     default: "."
  //   }
  // ]);

  return {
    rootDir: ".",
    exclude: ["node_modules"]
  };
};

const pickProjectFilePath = async (cwd: string) => {
  const defaultFilePath = path.join(cwd, DEFAULT_PROJECT_FILE_NAME);
  if (!fs.existsSync(defaultFilePath)) {
    return defaultFilePath;
  }

  return null;

  // const {fileName} = await inquirer.prompt<any>([
  //   {
  //     type: "input",
  //     name: "fileName",
  //     message: "Project file name"
  //   }
  // ]);

  // let filePath = path.join(cwd, fileName);
  // if (filePath.indexOf(PROJECT_FILE_EXTENSION) === -1) {
  //   filePath += `.${PROJECT_FILE_EXTENSION}`;
  // }

  // if (fs.existsSync(fileName)) {
  //   console.warn(chalk.yellow("A file with that name already exists in this directory."));
  //   return pickProjectFilePath(cwd);
  // }

  // return filePath;
};
