const { startLoader, compileFile, getConfigContext } = require("./main.node");
import { ConfigContext } from "@paperclip-ui/config";
import * as path from "path";
import * as fs from "fs";

type Options = {
  configFile: string;
  resourceProtocol?: string;
  globalScript: string;
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

  if (options.globalScript) {
    return callback(null, includeGlobalScript(options.globalScript));
  }
  const { configFile = DEFAULT_CONFIG_FILE_NAME } = options;
  const loader = getLoader(process.cwd(), configFile);

  const compiledFiles = compileFile(loader, this.resourcePath) || {};
  let mainContent: string;
  for (const compiledFilePath in compiledFiles) {
    if (/\.js$/.test(compiledFilePath)) {
      mainContent = compiledFiles[compiledFilePath];
    }
  }

  const configContext: ConfigContext = getConfigContext(loader);

  // inspiration: https://github.com/sveltejs/svelte-loader/blob/master/index.js
  if (configContext.config.globalScripts) {
    for (const relPath of configContext.config.globalScripts) {
      const scriptPath = relPath.includes("://")
        ? relPath
        : path.join(configContext.directory, relPath);
      mainContent =
        `import "${encodeURIComponent(
          scriptPath
        )}.js!=!paperclip-loader?globalScript=${scriptPath}!${path.join(
          configContext.directory,
          configContext.fileName
        )}";\n` + mainContent;
    }
  }

  callback(null, mainContent);
};

const includeGlobalScript = (script: string) => {
  if (script.includes("://")) {
    if (/\.css$/.test(script)) {
      return `
        const link = document.createElement("link");
        link.rel = "stylesheet";
        link.href = "${script}";
        document.head.appendChild(link);
      `;
    }
  } else {
    const content = fs.readFileSync(script, "utf8");
    if (/\.css$/.test(script)) {
      return `
        const style = document.createElement("style");
        style.textContent = ${JSON.stringify(content)};
        document.head.appendChild(style);
      `;
    } else if (/\.js/.test(script)) {
      return `
        const script = document.createElement("script");
        script.textContent = ${JSON.stringify(content)};
        document.head.appendChild(script);
      `;
    }
  }
};
