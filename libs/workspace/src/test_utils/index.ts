import * as path from "path";
import * as fsa from "fs-extra";
import { execa } from "execa";
import getPort from "get-port";
import {
  DesignerClientImpl,
  GrpcWebImpl,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";

export type Workspace = {
  getClient: () => DesignerClientImpl;
  localFilesPaths: Record<string, string>;
  dispose: () => void;
};

export type StartWorkspaceOptions = {
  files: Record<string, string>;
  namespace: string;
  port?: number;
};

export const startWorkspace = async ({
  files,
  namespace,
  port,
}: StartWorkspaceOptions): Promise<Workspace> => {
  if (!port) {
    port = await getPort();
  }

  files = { ...files };

  files["paperclip.config.json"] = JSON.stringify(
    {
      srcDir: ".",
      moduleDirs: [],
      compilerOptions: [
        {
          emit: [],
          assetOutDir: "assets",
        },
      ],
    },
    null,
    2
  );
  const tmpDirectory = `/private/tmp/pc-workspace/${namespace}`;
  try {
    fsa.rmdirSync(tmpDirectory);
  } catch (e) {}
  fsa.mkdirpSync(tmpDirectory);

  const localFilesPaths = {};

  for (const relativePath in files) {
    const filePath = path.join(tmpDirectory, relativePath);
    fsa.mkdirpSync(path.dirname(filePath));
    fsa.writeFileSync(filePath, files[relativePath]);
    localFilesPaths[relativePath] = filePath;
  }

  const ws = execa.command(
    `${__dirname}/../../../../target/debug/paperclip_cli designer --port=${port} --screenshots=false`,
    { cwd: tmpDirectory, stdio: "ignore" }
  );

  const getClient = () => {
    return new DesignerClientImpl(
      new GrpcWebImpl(`http://localhost:${port}`, {
        transport: NodeHttpTransport(),
      })
    );
  };

  const dispose = () => {
    ws.cancel();
    fsa.rmSync(tmpDirectory, {
      force: true,
      recursive: true,
    });
  };

  return { getClient, localFilesPaths, dispose };
};

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
