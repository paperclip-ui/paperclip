import { createEditorMachine } from "@paperclip-ui/designer/src/machine";
import { DEFAULT_STATE } from "@paperclip-ui/designer/src/machine/state";

export const startWorkspace = (files: Record<string, string>) => {
  const designer = createEditorMachine(DEFAULT_STATE);
};
