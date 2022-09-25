import { workspace, ExtensionContext } from "vscode";

import {
  LanguageClient,
  LanguageClientOptions,
  ServerOptions,
  TransportKind,
} from "vscode-languageclient/node";
import * as path from "path";
import { EventEmitter } from "events";
import { eventListener } from "@paperclip-ui/common";
import { EVENTS_NOTIFICATION_NAME } from "./constants";
import { ServerEvent, serverEvents } from "./server/events";
/**
 * Spins up language server
 */

export type ReadyInfo = ReturnType<typeof serverEvents.started>["payload"];

export class PaperclipLanguageClient {
  private _em: EventEmitter;

  private _client: LanguageClient;

  constructor(context: ExtensionContext) {
    this._em = new EventEmitter();

    const serverPath = context.asAbsolutePath(
      path.join("lib", "extension", "language", "server", "index.js")
    );
    const debugOptions = { execArgv: ["--nolazy", "--inspect=6009"] };
    const serverOptions: ServerOptions = {
      run: { module: serverPath, transport: TransportKind.ipc },
      debug: {
        module: serverPath,
        transport: TransportKind.ipc,
        options: debugOptions,
      },
    };

    // Options to control the language client
    const clientOptions: LanguageClientOptions = {
      // Register the server for plain text documents
      documentSelector: [{ scheme: "file", language: "paperclip" }],
      synchronize: {
        configurationSection: ["paperclip", "credentials"],
        // Notify the server about file changes to '.clientrc files contained in the workspace
        fileEvents: workspace.createFileSystemWatcher("**/.clientrc"),
      },
    };

    this._client = new LanguageClient(
      "paperclipLanguageServer",
      "Paperclip Language Server",
      serverOptions,
      clientOptions
    );

    this._client.onNotification(EVENTS_NOTIFICATION_NAME, this._onServerEvent);
  }

  private _onServerEvent = (event: ServerEvent) => {
    switch (event.type) {
      case serverEvents.started.type:
        return this._em.emit("ready", event.payload);
    }
  };

  onReady = (listener: (info: ReadyInfo) => void) => {
    return eventListener(this._em, "ready", listener);
  };

  async activate() {
    this._client.start();
  }
  dispose() {
    this._client.stop();
  }
}
