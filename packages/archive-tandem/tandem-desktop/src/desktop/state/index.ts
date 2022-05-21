import { PCConfig } from "paperclip";
import { ProjectConfig } from "@tandem-ui/designer";

export type TDProject = ProjectConfig;

type PreviewServerInfo = {
  port: number;
};

export type DesktopState = {
  tdProjectPath?: string;
  tdProject?: TDProject;
  info: {
    previewServer?: PreviewServerInfo;
  };
};
