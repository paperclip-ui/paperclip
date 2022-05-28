import { RPCClientAdapter } from "@paperclip-ui/common";
import { LoadOptions, Project } from "./project";
import { EditorClient } from "@paperclip-ui/editor-engine/lib/client/client";
import { DOMFactory } from "@paperclip-ui/web-renderer/lib/base";
import {
  readFileChannel,
  readDirectoryChannel,
  openUrlChannel,
  writeFileChannel,
  searchProjectChannel,
} from "@tandem-ui/workspace-core";

export class WorkspaceClient {
  private _editorClient: EditorClient;
  private _readFileChannel: ReturnType<typeof readFileChannel>;
  private _readDirectory: ReturnType<typeof readDirectoryChannel>;
  private _openUrl: ReturnType<typeof openUrlChannel>;
  private _writeFile: ReturnType<typeof writeFileChannel>;

  constructor(
    private _client: RPCClientAdapter,
    domFactory: DOMFactory = document
  ) {
    // for managing documents,
    this._editorClient = new EditorClient(_client);
    this._readFileChannel = readFileChannel(_client);
    this._readDirectory = readDirectoryChannel(_client);
    this._openUrl = openUrlChannel(_client);
    this._writeFile = writeFileChannel(_client);
  }
  openProject = async (options: LoadOptions) => {
    return await Project.load(options, this._editorClient, this._client);
  };

  readFile = async (url: string) => {
    const result = await this._readFileChannel.call({ url });
    console.log(
      `WorkspaceClient.readFile({${url}}): {content: ..., mimeType: ${result.mimeType}}`
    );
    return result;
  };
  writeFile = async (url: string, content: Buffer) => {
    const result = await this._writeFile.call({ url, content });
    return result;
  };

  readDirectory = async (url: string) => {
    console.log(`WorkspaceClient.readDirectory(${url})`);
    return await this._readDirectory.call({ url });
  };

  openUrl = async (url: string) => {
    console.log(`WorkspaceClient.openUrl(${url})`);
    return await this._openUrl.call({ url });
  };
}
