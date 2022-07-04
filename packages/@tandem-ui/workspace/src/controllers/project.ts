import execa from "execa";
import * as fsa from "fs-extra";
import * as path from "path";
import { VFS } from "./vfs";
import * as URL from "url";
import { Logger } from "@paperclip-lang/common";
import { Options } from "../core/options";
import { Package } from "./package";
import * as crypto from "crypto";
import { Repository } from "./git";
import { ProjectConfig, ProjectInfo } from "@tandem-ui/designer/lib/state";
import { findPaperclipSourceFiles } from "@paperclip-lang/core";

const DEFAULT_PROJECT_FILE_NAME = "app.tdproject";

export class Project {
  readonly repository: Repository;
  readonly package: Package;

  /**
   */

  constructor(
    readonly url: string,
    private _branch: string,
    _vfs: VFS,
    private _logger: Logger,
    private _options: Options,
    private _httpPort: number
  ) {
    const directory = isUrlLocal(this.url)
      ? URL.fileURLToPath(this.url)
      : getTemporaryDirectory(this.url, this._branch);
    this.repository = new Repository(directory, _logger);
    this.package = new Package(directory, _logger);
  }

  async getInfo(): Promise<ProjectInfo> {
    this._logger.info(`Project.getInfo()`);
    const filePath = path.join(
      URL.fileURLToPath(this.url),
      DEFAULT_PROJECT_FILE_NAME
    );
    const config: ProjectConfig = JSON.parse(
      await fsa.readFile(filePath, "utf8")
    );
    const pcUrls = findPaperclipSourceFiles(config, path.dirname(filePath)).map(
      (filePath) => URL.pathToFileURL(filePath).href
    );

    return { path: filePath, config, pcUrls };
  }

  /**
   */

  openBrowser() {
    // TODO - remove embedded flag
    execa("open", [
      `http://localhost:${
        this._httpPort
      }?projectId=${this.getId()}&showAll=true`,
    ]).catch(() => {
      console.warn(`Unable to launch browser`);
    });
  }

  /**
   * branchable directores are only available for projects
   * initialized from GIT repository since Tandem creates physically
   * new directories for each branch
   */

  isBranchable() {
    return !isUrlLocal(this.url);
  }

  /**
   */

  async commitAndPushChanges(description: string) {
    await this.repository.addAllChanges();
    await this.repository.commit(description);
    await this.repository.push();
  }

  /**
   */

  async checkout(branchName: string) {
    await this.repository.checkout(branchName);
  }

  /**
   */

  getId() {
    return getProjectId(this.url);
  }

  /**
   */

  async start() {
    if (!isUrlLocal(this.url)) {
      await this.repository.clone(this.url);
      await this.repository.checkout(this._branch);
    }

    if (this._options.project?.installDependencies !== false) {
      await this.package.install();
    }

    return this;
  }

  /**
   */

  async pushAllChanges(message: string) {
    // save all changes
    await this.repository.add("-A");
    await this.repository.commit(message);

    // need to be cognizant of rejections here. In that case, should
    // create new branch, push to that, and prompt user to fix using CLI
    await this.repository.push();
  }
}

const isUrlLocal = (url: string) => {
  return url.indexOf("file://") === 0;
};

const getTemporaryDirectory = (url: string, branch?: string) => {
  return `/tmp/pc-workspaces/${getProjectId(url)}${branch ? "-" + branch : ""}`;
};

export const getProjectId = (url: string) =>
  crypto.createHash("md5").update(url).digest("hex");
