import { tmpdir, platform } from "os";
const { distVersion } = require("../package");

const isWin = platform() === "win32";
export const PROJECT_FILE_EXTENSION = "tdproject";
export const DEFAULT_PROJECT_FILE_NAME = `app.${PROJECT_FILE_EXTENSION}`;
export const TMP_APP_ROOT_DIR = `${tmpdir()}/tandem`;
export const TMP_APP_DIR = `${tmpdir()}/tandem/${distVersion}`;
export const TMP_APP_BIN_PATH = isWin
  ? `${TMP_APP_DIR}/Tandem.${isWin ? "exe" : "app"}`.replace(/\//g, "\\")
  : `${TMP_APP_DIR}/Tandem.${isWin ? "exe" : "app"}`;
