import { FSItem, FSItemTagNames } from "tandem-common";
import { FrontEndEngineOptions } from "@tandem-ui/designer/lib/engines";
import { ProjectInfo } from "@tandem-ui/designer/lib/state";
import * as mime from "mime-types";
import { setReaderMimetypes } from "fsbox";
import { PAPERCLIP_MIME_TYPE } from "paperclip";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { workerRPCClientAdapter, wsAdapter } from "@paperclip-ui/common";

export type DesignerEngineOptions = {
  files: Record<string, string>;
  projectInfo: ProjectInfo;
  projectId: string;
};

const createDefaultRPCClient = () =>
  wsAdapter(() => new WebSocket("ws://" + location.host + "/ws"));

// TODO - move this to an isolated file
export const createDesignerEngine = ({
  files,
  projectInfo,
  projectId,
}: DesignerEngineOptions): FrontEndEngineOptions => {
  const wsClient = new WorkspaceClient(createDefaultRPCClient());

  wsClient
    .openProject({
      id: projectId,
    })
    .then((project) => {
      console.log(project);
    });

  const readDirectory = async (dir: string): Promise<FSItem[]> => {
    const dirTester = new RegExp(`^${dir}`);

    return Object.keys(files)
      .filter((uri) => uri.match(dirTester) != null)
      .map((uri) => {
        const rest = uri.replace(dirTester, "");

        if (rest.includes("/")) {
          const dirUri = dir + "/" + rest.split("/")[0];
          return {
            id: dirUri,
            name: FSItemTagNames.DIRECTORY,
            uri: dirUri,
            children: [],
          };
        }

        return { id: uri, name: FSItemTagNames.FILE, uri, children: [] };
      });
  };

  const deleteFile = (filePath: string) => {};

  const loadProjectInfo = async (): Promise<ProjectInfo> => {
    return Promise.resolve(projectInfo);
  };

  const readFile = setReaderMimetypes({
    [PAPERCLIP_MIME_TYPE]: [".pc"],
  })(async (uri: string) => {
    return {
      content: Buffer.from(files[uri], "utf8"),
      mimeType: mime.lookup(uri) || null,
    };
  });

  const writeFile = async (uri: string, content: Buffer) => {
    return true;
  };

  return {
    readDirectory,
    deleteFile,
    loadProjectInfo,
    readFile,
    writeFile,
  };
};
