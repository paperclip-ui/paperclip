import {
  template as reactTemplate,
  createFiles as createReactFiles,
} from "./react";
import {
  template as blankTemplate,
  createFiles as createBlankFiles,
} from "./blank";

const templatesById = {
  [reactTemplate.id]: reactTemplate,
  [blankTemplate.id]: blankTemplate,
};

const fileCreatorsById = {
  [reactTemplate.id]: createReactFiles,

  // Note that this MUST go last since it doesn't have any additional setup. I.e: requires
  // a more technical user to handle.
  [blankTemplate.id]: createBlankFiles,
};

export const templates = Object.values(templatesById);

export const createProjectFiles = (templateId: string, options: Object) =>
  fileCreatorsById[templateId](options);

export * from "./state";
