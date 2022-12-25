import { parsePC } from "@paperclip-ui/parser";
import { evaluate } from "@paperclip-ui/evaluator";
import { mapValues } from "lodash";
import crypto from "crypto";
import { DesignerState, DEFAULT_STATE } from "@paperclip-ui/designer/src/state";

export const loadGraph = async (files: Record<string, string>) => {
  const graph = {
    dependencies: mapValues(files, (content, path) => {
      const document = parsePC(
        content,
        crypto.createHash("md5").update(path).digest("hex")
      );
      return {
        hash: crypto.createHash("md5").update(content).digest("hex"),
        path,
        imports: {},
        document,
      };
    }),
  };

  const evaluated = {};

  for (const path in files) {
    evaluated[path] = await evaluate(path, graph);
  }

  return {
    graph,
    evaluated,
  };
};

type LoadStateOptions = {
  currentPath?: string;
  files: Record<string, string>;
  extraState: Partial<DesignerState>;
};

export const loadState = async ({
  files,
  currentPath = "/entry.pc",
  extraState,
}: LoadStateOptions): Promise<DesignerState> => {
  const { graph, evaluated } = await loadGraph(files);
  return {
    ...DEFAULT_STATE,
    ...extraState,
    graph,
    canvas: {
      size: { width: 1000, height: 1000 },
      transform: { x: 0, y: 0, z: 1 },
      mousePosition: { x: 0, y: 0 },
      scrollPosition: { x: 0, y: 0 },
    },
    currentDocument: {
      paperclip: evaluated[currentPath],
    },
    history: {
      pathname: "/",
      query: {
        file: currentPath,
      },
    },
  };
};
