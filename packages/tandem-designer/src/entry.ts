import { ProjectEngineOptions } from "./engines/project";
import { init } from "./index";
import { ProjectInfo } from "./state";

// TODO - move this to an isolated file
const createEngineOptions = (): ProjectEngineOptions => {
  const readDirectory = async () => {
    return null;
  };

  const deleteFile = (filePath: string) => {};

  const loadProjectInfo = async (): Promise<ProjectInfo> => {};

  return {
    readDirectory,
    deleteFile,
    loadProjectInfo,
  };
};

const { element } = init({
  document,
  engineOptions: createEngineOptions(),
});

const mount = document.createElement("div");
mount.appendChild(element);
