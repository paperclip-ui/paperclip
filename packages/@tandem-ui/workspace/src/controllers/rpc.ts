import { RPCClientAdapter, RPCServer } from "@paperclip-ui/common";
import * as channels from "@tandem-ui/workspace-core/lib/channels";
import { Channel } from "@paperclip-ui/common";
import * as fsa from "fs-extra";
import { Workspace } from "./workspace";
import { isPlainTextFile } from "@tandem-ui/common";
import * as URL from "url";
import * as path from "path";
import * as fs from "fs";
import { VFS } from "./vfs";
import { exec } from "child_process";
import { Options } from "../core/options";
import { Logger } from "@paperclip-ui/common";
import { EngineDelegate, paperclipSourceGlobPattern } from "@paperclip-ui/core";
import globby from "globby";
import {
  addProtocol,
  Directory,
  FILE_PROTOCOL,
  FSItem,
  FSItemTagNames,
} from "tandem-common";
import { FSReadResult } from "fsbox/src/base";
import * as mime from "mime-types";
import execa from "execa";
import { walkPCRootDirectory } from "paperclip";
import { QuickSearchUriResult } from "@tandem-ui/designer/lib/state";

// TODO - this needs to be moved to project RPC
export class RPC {
  constructor(
    server: RPCServer,
    private _workspace: Workspace,
    private _vfs: VFS,
    private _logger: Logger,
    private _httpPort: number,
    private _options: Options
  ) {
    server.onConnection(this._onConnection);
  }
  private _onConnection = (connection: RPCClientAdapter) => {
    this._logger.info(`Connection established`);
    new Connection(
      connection,
      this._workspace,
      this._vfs,
      this._logger,
      this._httpPort,
      this._options
    );
  };
}

// TODO - need to define workspace ID

class Connection {
  private _events: Channel<any, any>;

  // set from designer
  private _projectId: string;

  private _disposeEngineListener: any;

  constructor(
    connection: RPCClientAdapter,
    private _workspace: Workspace,
    private _vfs: VFS,
    private _logger: Logger,
    private _httpPort: number,
    private _options: Options
  ) {
    this._events = channels.eventsChannel(connection);
    channels.helloChannel(connection).listen(this._initialize);
    // channels.loadDirectoryChannel(connection).listen(this._loadDirectory);
    channels.openProjectChannel(connection).listen(this._openProject);
    channels
      .getAllPaperclipFilesChannel(connection)
      .listen(this._getAllPaperclipFiles);

    // TODO
    // channels.popoutWindowChannel(connection).listen(this._popoutWindow);
    channels.commitChangesChannel(connection).listen(this._commitChanges);
    channels.loadProjectInfoChannel(connection).listen(this._loadProjectInfo);
    channels.readDirectoryChannel(connection).listen(this._readDirectory);
    channels.readFileChannel(connection).listen(this._readFile);
    channels.openUrlChannel(connection).listen(this._openUrl);
    channels.writeFileChannel(connection).listen(this._writeFile);
    channels.searchProjectChannel(connection).listen(this._searchProject);
    channels.createDirectoryChannel(connection).listen(this._createDirectory);
    channels.deleteFileChannel(connection).listen(this._deleteFile);
    // channels.setBranchChannel(connection).listen(this._setBranch);
    // channels.editPCSourceChannel(connection).listen(this._editPCSource);
  }

  private getProject() {
    return this._workspace.getProjectById(this._projectId);
  }

  private _createDirectory = async ({ url }) => {
    this._logger.info(`Connection.createDirectory({url: ${url}})`);
    const filePath = URL.fileURLToPath(url);
    await fsa.mkdirp(filePath);
  };

  private _deleteFile = async ({ url }) => {
    this._logger.info(`Connection.deleteFile({url: ${url}})`);
    const filePath = URL.fileURLToPath(url);
    fsa.rmSync(filePath, { recursive: true, force: true });
  };

  private _writeFile = async ({ url, content }) => {
    this._logger.info(`Connection.writeFile({url: ${url}})`);

    await fsa.writeFile(URL.fileURLToPath(url), content);
  };

  private _searchProject = async ({
    filterText,
    projectId,
  }): Promise<QuickSearchUriResult[]> => {
    this._logger.info(
      `Connection.searchProject({ filterText: ${filterText} })`
    );

    const pattern = new RegExp(
      escapeRegExp(filterText).split(" ").join(".*?"),
      "i"
    );

    const project = this._workspace.getProjectById(projectId);
    const info = await project.getInfo();
    const projectDir = path.dirname(info.path);

    const results: QuickSearchUriResult[] = [];

    walkPCRootDirectory(info.config, projectDir, (filePath, isDirectory) => {
      if (!isDirectory && pattern.test(filePath)) {
        results.push({
          url: URL.pathToFileURL(filePath).href,
          label: path.basename(filePath),
          description: path.dirname(filePath),

          // TODO - need to use constant
          type: "url" as any,
        });
      }
    });

    // limit results
    return results.slice(0, 50);
  };

  private _readDirectory = async ({ url }): Promise<FSItem[]> => {
    this._logger.info(`Connection.readDirectory(${JSON.stringify({ url })})`);
    return fsa.readdir(URL.fileURLToPath(url)).then((basenames) =>
      basenames.map((basename) => {
        const childUrl = url + "/" + basename;
        return {
          id: childUrl,
          uri: childUrl,
          children: [],
          name: fsa.lstatSync(URL.fileURLToPath(childUrl)).isDirectory()
            ? FSItemTagNames.DIRECTORY
            : FSItemTagNames.FILE,
        } as Directory;
      })
    );
  };

  private _readFile = async ({ url }): Promise<FSReadResult> => {
    this._logger.info(`Connection.readFile(${JSON.stringify({ url })})`);
    const filePath = URL.fileURLToPath(url);
    return {
      content: await fsa.readFile(filePath),
      mimeType: mime.lookup(filePath),
    };
  };

  private _openUrl = async ({ url }) => {
    this._logger.info(`Connection.openUrl(${JSON.stringify({ url })})`);
    await execa(`open`, [url]);
  };

  private _getAllPaperclipFiles = async ({ projectId }) => {
    const project = this._workspace.getProjectById(projectId);
    const filePaths = await globby(
      paperclipSourceGlobPattern(project.repository.localDirectory),
      {
        cwd: project.repository.localDirectory,
        ignore: ["**/node_modules/**"],
        gitignore: true,
      }
    );
    return filePaths.map((filePath) => URL.pathToFileURL(filePath).href);
  };

  private _loadProjectInfo = async ({ projectId }) => {
    const project = this._workspace.getProjectById(projectId);
    return project.getInfo();
  };

  private _openProject = async ({ id, uri, branch }) => {
    const project = id
      ? this._workspace.getProjectById(id)
      : await this._workspace.start(uri, branch);

    return {
      id: project.getId(),
      directoryPath: project.repository.localDirectory,
      directoryUri: URL.pathToFileURL(
        project.repository.localDirectory
      ).toString(),
    };
  };

  private _editCode = async ({ uri, value }) => {
    this._vfs.updateFileContent(uri, value);
  };

  private _popoutWindow = async ({ path }) => {
    let host = `http://localhost:${this._httpPort}`;
    let url = host + path;
    exec(`open "${url}"`);
  };
  private _commitChanges = async ({ description }) => {
    return await this.getProject().commitAndPushChanges(description);
  };
  private _initialize = async ({ projectId }) => {
    this._logger.info(`Setting connection project ID to ${projectId}`);
    this._projectId = projectId;

    const project = this.getProject();

    if (!project) {
      this._logger.info(`Project ID does not exist`);
      return {
        showFullEditor: this._options.showFullEditor,
        canvasFile: this._options.canvasFile,
        branchInfo: {
          branchable: false,
          branches: [],
          currentBranch: null,
        },
        localResourceRoots: [],
      };
    }

    this._handleEngineEvents();

    return {
      showFullEditor: this._options.showFullEditor,
      canvasFile: this._options.canvasFile,
      branchInfo: {
        branches: await project.repository.getBranches(),
        branchable: project.isBranchable(),
        currentBranch: await project.repository.getCurrentBranch(),
      },
      localResourceRoots: [project.repository.localDirectory],
    };
  };

  private _handleEngineEvents() {
    if (this._disposeEngineListener) {
      this._disposeEngineListener();
    }

    const project = this.getProject();
  }

  private _setBranch = ({ branchName }) => {
    this.getProject().checkout(branchName);
  };
}

function escapeRegExp(string) {
  return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&"); // $& means the whole matched string
}
