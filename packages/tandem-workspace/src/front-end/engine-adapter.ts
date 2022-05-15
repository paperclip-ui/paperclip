import { FSItem, FSItemTagNames } from "tandem-common";

import { FrontEndEngineOptions } from "tandem-designer/src/engines";
import { ProjectInfo } from "tandem-designer/src/state";
import * as mime from "mime-types";
import { setReaderMimetypes } from "fsbox";
import { PAPERCLIP_MIME_TYPE } from "paperclip";

export type MockEngineOptions = {
  files: Record<string, string>;
  projectInfo: ProjectInfo;
};

// TODO - move this to an isolated file
export const createMockEngineOptions = ({
  files,
  projectInfo,
}: MockEngineOptions): FrontEndEngineOptions => {
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
