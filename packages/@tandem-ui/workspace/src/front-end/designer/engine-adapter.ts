import { FSItem, FSItemTagNames } from "tandem-common";
import { FrontEndEngineOptions } from "@tandem-ui/designer/lib/engines";
import { ProjectInfo } from "@tandem-ui/designer/lib/state";
import * as mime from "mime-types";
import { setReaderMimetypes } from "fsbox";
import { PAPERCLIP_MIME_TYPE } from "paperclip";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { wsAdapter } from "@paperclip-ui/common";
import { Project } from "@tandem-ui/workspace-client/lib/project";

export type DesignerEngineOptions = {
  files: Record<string, string>;
  projectInfo: ProjectInfo;
  projectId: string;
};

const createDefaultRPCClient = () =>
  wsAdapter(() => new WebSocket("ws://" + location.host + "/ws"));

// TODO - move this to an isolated file
export const createDesignerEngine = ({
  projectId,
}: DesignerEngineOptions): FrontEndEngineOptions => {
  const wsClient = new WorkspaceClient(createDefaultRPCClient());
  let _project: Project;

  const readDirectory = async (dir: string): Promise<FSItem[]> => {
    return wsClient.readDirectory(dir);
  };

  const deleteFile = (filePath: string) => {};

  const getProject = async () =>
    _project || (_project = await wsClient.openProject({ id: projectId }));

  const loadProjectInfo = async (): Promise<ProjectInfo> => {
    const info = await getProject().then((project) => project.getInfo());
    return info;
  };

  const readFile = setReaderMimetypes({
    [PAPERCLIP_MIME_TYPE]: [".pc"],
  })(async (uri: string) => {
    console.log("READ", uri);
    return wsClient.readFile(uri);
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
