import { createEditorMachine } from "@paperclip-ui/designer/lib/machine";
import {
  DEFAULT_STATE,
  EditorState,
} from "@paperclip-ui/designer/lib/machine/state";
import * as fsa from "fs-extra";
import * as execa from "execa";
import getPort from "get-port";
import expect from "expect.js";
import { EditorEvent } from "@paperclip-ui/designer/lib/machine/events";

export const startWorkspace = async (files: Record<string, string>) => {
  const port = await getPort();
  const designer = createEditorMachine(DEFAULT_STATE);
  const tmpDirectory = `/tmp/pc-workspace/${Math.random()}`;
  fsa.mkdirSync(tmpDirectory);
  const ws = execa.command(
    `../../../../target/debug/paperclip_cli designer --port=${port}`,
    { cwd: __dirname }
  );

  const oldDispatch = designer.dispatch;
  designer.dispatch = (event: EditorEvent) => {
    console.log(event);
    oldDispatch(event);
  };

  return { designer };
};
