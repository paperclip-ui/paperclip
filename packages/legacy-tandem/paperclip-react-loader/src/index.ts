import { translatePaperclipModuleToReact } from "paperclip-react-compiler";
import * as migrate from "paperclip-migrator";
import {
  loadFSDependencyGraphSync,
  getComponentGraphRefMap,
  getPCNodeDependency,
} from "paperclip";
import { normalizeFilePath } from "tandem-common";
const loaderUtils = require("loader-utils");

// TODO - use options for
module.exports = function (source) {
  this.cacheable && this.cacheable();
  const callback = this.async();
  const uri = normalizeFilePath(this.resource);
  const options = loaderUtils.getOptions(this) || {};
  const useHMR = options.hmr == null ? true : options.hmr;
  const graph = loadFSDependencyGraphSync(
    options.config,
    process.cwd(),
    migrate
  );
  const entry = graph["file://" + uri];

  let content = translatePaperclipModuleToReact(
    entry,
    graph,
    process.cwd()
  ).buffer;
  const refMap = getComponentGraphRefMap(entry.content, graph);
  const depUriMap = {};
  for (const refId in refMap) {
    const ref = getPCNodeDependency(refId, graph);
    depUriMap[ref.uri] = 1;
  }

  Object.keys(depUriMap).forEach((uri) => {
    this.addDependency(uri.replace("file://", ""));
  });

  if (useHMR) {
    content +=
      `\n` +
      `if (module.hot) {\n` +
      `  module.hot.accept(function() { window.reload(); });` +
      `}`;
  }

  callback(null, content);
};
