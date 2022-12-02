import { Deferred, eventListener } from "@paperclip-ui/common";
import * as getPort from "get-port";
import * as execa from "execa";
import * as waitPort from "wait-port";
import * as URL from "url";
global.XMLHttpRequest = require("xhr2");
import {
  DesignerClientImpl,
  FileChanged,
  GrpcWebImpl,
} from "@paperclip-ui/proto/lib/generated/service/designer";
import { loadCLIBinPath } from "@paperclip-ui/releases";
import { DocumentInfo } from "@paperclip-ui/proto/lib/generated/language_service/pc";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import { EventEmitter } from "stream";

export class DesignerClient {
  private _client: Deferred<DesignerClientImpl>;
  private _port: number;
  private _em: EventEmitter;

  constructor() {
    this._em = new EventEmitter();
    this._client = new Deferred();
    this._start();
  }
  onFileChange(listener: (data: FileChanged) => void) {
    return eventListener(this._em, "fileChanged", listener);
  }
  getPort() {
    return this._port;
  }
  private async _start() {
    this._port = await startDesignServer();
    const client = new DesignerClientImpl(
      new GrpcWebImpl(`http://localhost:${this._port}`, {
        transport: NodeHttpTransport(),
      })
    );
    this._client.resolve(client);
    this._watchForEvents();
  }
  async ready() {
    await this._client.promise;
  }
  private _watchForEvents = async () => {
    const client = await this._client.promise;
    client.OnEvent({}).subscribe({
      next: (data) => {
        console.log("EVENT", data);
        if (data.fileChanged) {
          this._em.emit("fileChanged", data.fileChanged);
        }
      },
    });
  };
  async updateVirtualFileContent(url: string, text: string) {
    const client = await this._client.promise;
    return new Promise((resolve, reject) => {
      const content = new TextEncoder();
      client
        .UpdateFile({
          path: URL.fileURLToPath(url),
          content: content.encode(text),
        })
        .then(resolve, reject);
    });
  }

  async getDocumentInfo(url: string): Promise<DocumentInfo> {
    const client = await this._client.promise;
    return new Promise((resolve, reject) => {
      client
        .GetDocumentInfo({ path: URL.fileURLToPath(url) })
        .then(resolve, reject);
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
