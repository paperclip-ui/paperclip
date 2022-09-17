import * as loaderUtils from "loader-utils";
import * as path from "path";

type Options = {
  configFile: string;
  resourceProtocol?: string;
};

const DEFAULT_CONFIG_FILE_NAME = "paperclip.config.json";

module.exports = function (source: string) {
  this.cacheable();
  const callback = this.async();
  const options: Options = { ...loaderUtils.getOptions(this) };
  const { configFile = DEFAULT_CONFIG_FILE_NAME } = options;
  const configFilePath = path.join(process.cwd(), configFile);

  let config: any;

  try {
    config = require(configFilePath);
  } catch (e) {
    throw new Error(`Config file could not be loaded: ${configFilePath}`);
  }
};
