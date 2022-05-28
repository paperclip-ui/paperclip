import { RPCClientAdapter } from "@paperclip-ui/common";
import { LoadOptions, Project } from "./project";
import { EditorClient } from "@paperclip-ui/editor-engine/lib/client/client";
import { DOMFactory } from "@paperclip-ui/web-renderer/lib/base";
import { readFileChannel } from "@tandem-ui/workspace-core";

export class WorkspaceClient {
  private _editorClient: EditorClient;
  private _readFileChannel: ReturnType<typeof readFileChannel>;
  constructor(
    private _client: RPCClientAdapter,
    domFactory: DOMFactory = document
  ) {
    // for managing documents,
    this._editorClient = new EditorClient(_client);
    this._readFileChannel = readFileChannel(_client);
  }
  openProject = async (options: LoadOptions) => {
    return await Project.load(options, this._editorClient, this._client);
  };

  readFile = async (uri: string) => {
    return await this._readFileChannel.call({ uri });
  };
}
