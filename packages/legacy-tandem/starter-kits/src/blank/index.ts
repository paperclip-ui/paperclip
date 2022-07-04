import { ProjectTemplate, ProjectFileCreator } from "../state";
import {
  createPCModule,
  createPCComponent,
  createPCTextNode,
  PCVisibleNodeMetadataKey,
} from "@paperclip-lang/core";
import { createBounds } from "tandem-common";

export const template: ProjectTemplate = {
  id: "blank",
  icon: null,
  label: "Blank",
  description:
    "Blank project without libraries. Good if you want to setup the project on your own, or if you're looking to integrate Tandem into an existing application.",
};

export type BlankProjectOptions = {};

export const createFiles: ProjectFileCreator = ({}: BlankProjectOptions) => {
  const mainComponent = createPCComponent(
    "Application",
    null,
    null,
    null,
    [createPCTextNode("App content")],
    {
      [PCVisibleNodeMetadataKey.BOUNDS]: createBounds(0, 600, 0, 400),
    }
  );

  return {
    "./src/main.pc": JSON.stringify(createPCModule([mainComponent]), null, 2),
  };
};
