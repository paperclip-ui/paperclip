import { PROJECT_FILE_EXTENSION } from "./constants";
import * as fs from "fs";
import * as path from "path";

export const findTDProjectFilePath = (cwd: string) => {
  const result = fs
    .readdirSync(cwd)
    .find(
      filename => filename.split(".").indexOf(PROJECT_FILE_EXTENSION) !== -1
    );
  return result && path.join(cwd, result);
};
