import { createEditorMachine } from "@paperclip-ui/designer/lib/machine";
import * as path from "path";
import { DEFAULT_STATE } from "@paperclip-ui/designer/lib/machine/state";
import * as fsa from "fs-extra";
import * as execa from "execa";
import getPort from "get-port";
import { EditorEvent } from "@paperclip-ui/designer/lib/machine/events";

export const startWorkspace = async (files: Record<string, string>) => {
  const tmpDirectory = `/tmp/pc-workspace/${Math.random()}`;
  fsa.mkdirpSync(tmpDirectory);

  const savedPaths = {};

  for (const relativePath in files) {
    const filePath = path.join(tmpDirectory, relativePath);
    fsa.mkdirpSync(path.dirname(filePath));
    fsa.writeFileSync(filePath, files[relativePath]);
    savedPaths[relativePath] = filePath;
  }

  history.pushState({}, "", "/?file=" + savedPaths["entry.pc"]);

  const port = await getPort();
  const designer = createEditorMachine({
    host: `localhost:${port}`,
  })(DEFAULT_STATE);

  const ws = execa.command(
    `../../../../target/debug/paperclip_cli designer --port=${port}`,
    { cwd: __dirname }
  );

  const oldDispatch = designer.dispatch;
  designer.dispatch = (event: EditorEvent) => {
    oldDispatch(event);
    console.log("DISP");
  };

  return { designer };
};
