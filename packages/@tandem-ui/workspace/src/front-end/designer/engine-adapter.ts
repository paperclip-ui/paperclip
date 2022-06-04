import { FSItem } from "tandem-common";
import { FrontEndEngineOptions } from "@tandem-ui/designer/lib/engines";
import { ProjectInfo, QuickSearchResult } from "@tandem-ui/designer/lib/state";
import { setReaderMimetypes } from "fsbox";
import { PAPERCLIP_MIME_TYPE } from "paperclip";
import { WorkspaceClient } from "@tandem-ui/workspace-client";
import { wsAdapter } from "@paperclip-ui/common";
import { Project } from "@tandem-ui/workspace-client/lib/project";

export type DesignerEngineOptions = {
  files: Record<string, string>;
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

  const deleteFile = (url: string) => {
    wsClient.deleteFile(url);
  };

  const getProject = async () =>
    _project || (_project = await wsClient.openProject({ id: projectId }));

  const loadProjectInfo = async (): Promise<ProjectInfo> => {
    const info = await getProject().then((project) => project.getInfo());
    return info;
  };

  const readFile = setReaderMimetypes({
    [PAPERCLIP_MIME_TYPE]: [".pc"],
  })(async (url: string) => {
    return wsClient.readFile(url);
  });

  const writeFile = async (url: string, content: Buffer) => {
    wsClient.writeFile(url, content);
    return true;
  };

  const openExternalFile = (url: string) => {
    wsClient.openUrl(url);
  };

  const createDirectory = (filePath: string) => {
    wsClient.createDirectory(filePath);
  };

  const renameFile = (url: string, newBaseName: string) => {
    wsClient.renameFile(url, newBaseName);
  };

  const searchProject = async (
    filterText: string
  ): Promise<QuickSearchResult[]> => {
    const results = await _project.search(filterText);
    return results;
  };

  return {
    readDirectory,
    searchProject,
    createDirectory,
    deleteFile,
    renameFile,
    openExternalFile,
    loadProjectInfo,
    readFile,
    writeFile,
  };
};
