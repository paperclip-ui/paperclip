import { createEditorMachine } from "@paperclip-ui/designer/src/machine";
import { DEFAULT_STATE } from "@paperclip-ui/designer/src/machine/state";
import * as fsa from "fs-extra";
import * as execa from "execa";
import getPort from "get-port";

export const startWorkspace = async (files: Record<string, string>) => {
  const port = await getPort();
  const designer = createEditorMachine(DEFAULT_STATE);
  const tmpDirectory = `/tmp/pc-workspace/${Math.random()}`;
  fsa.mkdirSync(tmpDirectory);
  const ws = execa.command(
    `../../../../target/debug/paperclip_cli designer --port=${port}`,
    { cwd: __dirname }
  );

  return { designer };
};
