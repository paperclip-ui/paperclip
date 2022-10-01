import * as path from "path";
import { Deferred } from "@paperclip-ui/common";
import * as getPort from "get-port";
import * as execa from "execa";
import * as waitPort from "wait-port";
import { DesignerClient as GRPCDesignerClient } from "@paperclip-ui/proto/lib/service/designer_grpc_web_pb";
import { loadCLIBinPath } from "@paperclip-ui/releases";
import { UpdateFileRequest } from "@paperclip-ui/proto/lib/service/designer_pb";

export class DesignerClient {
  private _client: Deferred<GRPCDesignerClient>;
  private _port: number;
  constructor() {
    this._client = new Deferred();
    this._start();
  }
  getPort() {
    return this._port;
  }
  private async _start() {
    this._port = await startDesignServer();
    this._client.resolve(new GRPCDesignerClient(`::${this._port}`));
  }
  async ready() {
    await this._client.promise;
  }
  async updateVirtualFileContent(filePath: string, text: string) {
    const client = await this._client.promise;
    const request = new UpdateFileRequest();
    const content = new TextEncoder();
    request.setPath(filePath).setContent(content.encode(text));
    client.updateFile(request, {}, () => {});
  }
}

const startDesignServer = async () => {
  // 1. look for open designer
  // 2. if no open designer, then look for VS Code binary
  //   a. download binary from releases based on VS Code extension
  // 3. Connect to local GRPC server

  const port = await getPort();
  const binPath = await loadCLIBinPath("/tmp/paperclip");
  console.log(binPath);

  execa(binPath, [`designer`, `--port`, String(port)], {
    stdio: "inherit",
  });

  // wait until it's open
  await waitPort({
    port: port,
  });

  return port;
};
