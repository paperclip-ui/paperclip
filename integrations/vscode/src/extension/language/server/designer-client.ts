import { Deferred } from "@paperclip-ui/common";
import * as getPort from "get-port";
import * as execa from "execa";
import * as waitPort from "wait-port";
import * as URL from "url";
global.XMLHttpRequest = require("xhr2");
import { DesignerClient as GRPCDesignerClient } from "@paperclip-ui/proto/lib/service/designer_grpc_web_pb";
import { loadCLIBinPath } from "@paperclip-ui/releases";
import {
  FileRequest,
  UpdateFileRequest,
} from "@paperclip-ui/proto/lib/service/designer_pb";
import { DocumentInfo } from "@paperclip-ui/proto/lib/language_service/pc_pb";

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
    this._client.resolve(
      new GRPCDesignerClient(`http://localhost:${this._port}`)
    );
  }
  async ready() {
    await this._client.promise;
  }
  async updateVirtualFileContent(url: string, text: string) {
    const client = await this._client.promise;
    const request = new UpdateFileRequest();
    const content = new TextEncoder();
    request.setPath(URL.fileURLToPath(url)).setContent(content.encode(text));
    return new Promise((resolve, reject) => {
      client.updateFile(request, {}, (err, response) => {
        if (err) return reject(err);
        resolve(response);
      });
    });
  }

  async getDocumentInfo(url: string): Promise<DocumentInfo.AsObject> {
    const client = await this._client.promise;
    const request = new FileRequest();
    request.setPath(URL.fileURLToPath(url));
    return new Promise((resolve, reject) => {
      client.getDocumentInfo(request, {}, (err, response) => {
        if (err) return reject(err);
        resolve(response.toObject());
      });
    });
  }
}

const startDesignServer = async () => {
  // 1. look for open designer
  // 2. if no open designer, then look for VS Code binary
  //   a. download binary from releases based on VS Code extension
  // 3. Connect to local GRPC server

  const port = await getPort();
  const binPath = await loadCLIBinPath("/tmp/paperclip");

  execa(binPath, [`designer`, `--port`, String(port)], {
    stdio: "inherit",
  });

  // wait until it's open
  await waitPort({
    port: port,
  });

  return port;
};
