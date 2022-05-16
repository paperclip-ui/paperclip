import { DependencyGraph, Dependency } from "paperclip";
import * as path from "path";
import { translatePaperclipModuleToHTMLRenderers } from "./html-compiler";
import {
  KeyValue,
  EMPTY_ARRAY,
  stripProtocol,
  EMPTY_OBJECT,
} from "tandem-common";

export type CompiledDependency = {
  imports: KeyValue<string>;
  module: CompiledModule;
};
export type CompiledModule = (
  require: Function,
  module: Object,
  exports: Object
) => void;

export type Bundle = KeyValue<CompiledDependency>;

export const bundleDependencyGraph = (
  graph: DependencyGraph,
  rootDirectory: string
) => {
  let bundle: Bundle = {};
  for (const uri in graph) {
    bundle = addDependencyToBundle(uri, bundle, graph, rootDirectory);
  }

  return bundle;
};

const addDependencyToBundle = (
  uri,
  bundle: Bundle,
  graph: DependencyGraph,
  rootDirectory: string
): Bundle => {
  const filePath = stripProtocol(uri);
  if (bundle[filePath]) {
    return bundle;
  }

  // define now to avoid circular deps
  bundle = {
    ...bundle,
    [filePath]: {
      imports: EMPTY_OBJECT,
      module: null,
    },
  };

  // PC module
  if (graph[uri]) {
    const entry = graph[uri];
    const content = translatePaperclipModuleToHTMLRenderers(
      entry,
      graph,
      rootDirectory
    ).buffer;
    const imports = (content.match(/require\(.*?\)/g) || EMPTY_ARRAY).map(
      (req: string) => {
        return req.match(/require\(["'](.*?)["']\)/)[1];
      }
    );

    const resolvedImports = {};

    for (const relativePath of imports) {
      const fullPath = path.resolve(
        path.dirname(stripProtocol(entry.uri)),
        relativePath
      );
      resolvedImports[relativePath] = fullPath;
      bundle = addDependencyToBundle(fullPath, bundle, graph, rootDirectory);
    }

    const module = new Function(
      `require`,
      `module`,
      `exports`,
      content
    ) as CompiledModule;

    return {
      ...bundle,
      [filePath]: {
        imports: resolvedImports,
        module,
      },
    };
  } else {
  }

  return bundle;
};

export const evaluateBundle = (
  entryPath: string,
  bundle: Bundle,
  resolveExternal: (uri) => any
) => {
  let imported = {};

  let require = (filePath: string) => {
    if (imported[filePath]) {
      return imported[filePath].exports;
    }
    const module = (imported[filePath] = {
      exports: {},
    });
    const dep = bundle[filePath];

    if (!dep.module) {
      module.exports = resolveExternal(filePath);
    } else {
      dep.module(
        (relativePath) => {
          const fullPath = dep.imports[relativePath];
          return require(fullPath);
        },
        module,
        module.exports
      );
    }

    return module.exports;
  };

  return require(stripProtocol(entryPath));
};
