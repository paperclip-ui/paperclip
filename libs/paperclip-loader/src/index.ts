import * as path from "path";
console.log("OK");
const { start } = require("./index.node");
console.log("OK");

const engine = start();
console.log(engine);

type Options = {
  configFile: string;
  resourceProtocol?: string;
};

const DEFAULT_CONFIG_FILE_NAME = "paperclip.config.json";

let _engine: any;

const getEngine = () => {
  if (!_engine) {
    _engine = start();
  }
  return _engine;
};

module.exports = function (source: string) {
  this.cacheable();
  const callback = this.async();
  const options: Options = { ...this.getOptions() };
  const { configFile = DEFAULT_CONFIG_FILE_NAME } = options;
  const configFilePath = path.join(process.cwd(), configFile);

  const engine = getEngine();
  // engine.compile(source, this.path);
  // })

  // try {
  //   config = require(configFilePath);
  // } catch (e) {
  //   throw new Error(`Config file could not be loaded: ${configFilePath}`);
  // }

  return source;
};
