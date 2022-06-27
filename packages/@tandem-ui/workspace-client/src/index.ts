import { RPCClientAdapter } from "@paperclip-lang/common";
import { LoadOptions, Project } from "./project";
import {
  readFileChannel,
  readDirectoryChannel,
  openUrlChannel,
  writeFileChannel,
  searchProjectChannel,
  createDirectoryChannel,
  deleteFileChannel,
  renameFileChannel,
} from "@tandem-ui/workspace-core";

export class WorkspaceClient {
  // private _editorClient: EditorClient;
  private _readFileChannel: ReturnType<typeof readFileChannel>;
  private _readDirectory: ReturnType<typeof readDirectoryChannel>;
  private _openUrl: ReturnType<typeof openUrlChannel>;
  private _writeFile: ReturnType<typeof writeFileChannel>;
  private _createDirectory: ReturnType<typeof createDirectoryChannel>;
  private _deleteFile: ReturnType<typeof deleteFileChannel>;
  private _renameFileChannel: ReturnType<typeof renameFileChannel>;

  constructor(private _client: RPCClientAdapter) {
    // for managing documents,
    // this._editorClient = new EditorClient(_client);
    this._readFileChannel = readFileChannel(_client);
    this._readDirectory = readDirectoryChannel(_client);
    this._openUrl = openUrlChannel(_client);
    this._writeFile = writeFileChannel(_client);
    this._createDirectory = createDirectoryChannel(_client);
    this._deleteFile = deleteFileChannel(_client);
    this._renameFileChannel = renameFileChannel(_client);
  }
  openProject = async (options: LoadOptions) => {
    return await Project.load(options, this._client);
  };

  readFile = async (url: string) => {
    const result = await this._readFileChannel.call({ url });
    return result;
  };
  writeFile = async (url: string, content: Buffer) => {
    const result = await this._writeFile.call({ url, content });
    return result;
  };

  readDirectory = async (url: string) => {
    return await this._readDirectory.call({ url });
  };

  openUrl = async (url: string) => {
    return await this._openUrl.call({ url });
  };

  createDirectory = async (url: string) => {
    return await this._createDirectory.call({ url });
  };

  deleteFile = async (url: string) => {
    return await this._deleteFile.call({ url });
  };

  renameFile = async (url: string, newBaseName: string) => {
    return await this._renameFileChannel.call({ url, newBaseName });
  };
}
