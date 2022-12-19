import * as path from "path";
import * as fsa from "fs-extra";
import * as execa from "execa";
import getPort from "get-port";
import {
  DesignerClientImpl,
  GrpcWebImpl,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";

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
