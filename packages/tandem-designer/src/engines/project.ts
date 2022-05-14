import { FSItem } from "tandem-common";
import { ProjectInfo } from "../state";

export type ProjectEngineOptions = {
  readDirectory(path: string): Promise<FSItem>;
  deleteFile(path: string);
  loadProjectInfo(): Promise<ProjectInfo>;
};
