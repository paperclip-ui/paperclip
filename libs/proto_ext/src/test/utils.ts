import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";
import { startWorkspace } from "@paperclip-ui/workspace/lib/test_utils";

// So many backflips in order to parse a PC file. I have a somewhat decent
// excuse I promise. TL;DR: we depend on protobuffs to be serialized in a very specific
// way and the libraries that we're using are coupled to GRPC layers, so we're piggy-backing
// of of workspaces for this. This is shit code though.
export const parseFiles = async (
  files: Record<string, string>,
  namespace: string = "tmp-" + Math.random()
): Promise<Graph> => {
  return new Promise(async (resolve) => {
    const workspace = await startWorkspace({
      files,
      namespace,
    });

    // TODO: fix race condition
    await new Promise((resolve) => setTimeout(resolve, 100));

    const graph = {
      dependencies: {},
    };

    workspace
      .getClient()
      .GetGraph({
        path: workspace.localFilesPaths["entry.pc"],
      })
      .subscribe({
        next: (data) => {
          for (const filePath in files) {
            const dep = data.dependencies[workspace.localFilesPaths[filePath]];
            if (dep) {
              const imports = {};
              for (const key in dep.imports) {
                imports[key] = Object.entries(workspace.localFilesPaths).find(
                  ([rel, abs]) => {
                    return dep.imports[key] === abs;
                  }
                )[0];
              }

              graph.dependencies[filePath] = {
                ...dep,
                imports,
              };
            } else if (!graph.dependencies[filePath]) {
              return;
            }
          }

          resolve(graph);
          workspace.dispose();
        },
      });
  });
};
