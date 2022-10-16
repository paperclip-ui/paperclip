const { startLoader, compileFile } = require("./main.node");

type Options = {
  configFile: string;
  resourceProtocol?: string;
};

const DEFAULT_CONFIG_FILE_NAME = "paperclip.config.json";

let _loader: any;

const getLoader = (directory: string, configFileName: string) => {
  if (!_loader) {
    _loader = startLoader(directory, configFileName);
  }
  return _loader;
};

module.exports = function (source: string) {
  this.cacheable();
  const callback = this.async();
  const options: Options = { ...this.getOptions() };
  const { configFile = DEFAULT_CONFIG_FILE_NAME } = options;
  const loader = getLoader(process.cwd(), configFile);

  const compiledFiles = compileFile(loader, this.resourcePath);
  let mainContent: string;
  for (const compiledFilePath in compiledFiles) {
    if (/\.js$/.test(compiledFilePath)) {
      mainContent = compiledFiles[compiledFilePath];
    }
  }

  callback(null, mainContent);
};
