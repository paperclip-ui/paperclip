import { createEditorMachine } from "../../src/machine";
import * as path from "path";
import { DEFAULT_STATE, EditorState } from "../../src/machine/state";
import * as fsa from "fs-extra";
import * as execa from "execa";
import getPort from "get-port";
import { EditorEvent } from "../../src/machine/events";
import { EventEmitter } from "events";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import { Machine } from "@paperclip-ui/common";
import { designerEngineEvents } from "@paperclip-ui/designer/src/machine/engine/designer/events";

type Workspace = {
  onEvent(listener: (event: EditorEvent) => void): () => void;
  designer: Machine<EditorState, EditorEvent>;
};

export const startWorkspace = async (
  files: Record<string, string>,
  initialState: Partial<EditorState> = {},
  namespace: string = "tmp-workspace"
): Promise<Workspace> => {
  files["paperclip.config.json"] = JSON.stringify(
    {
      srcDir: ".",
      moduleDirs: [],
      compilerOptions: [
        {
          emit: ["yew.rs:rs", "css", "react.js:js", "react.d.ts:d.ts"],
          assetOutDir: "assets",
        },
      ],
    },
    null,
    2
  );
  const tmpDirectory = `/private/tmp/pc-workspace/${namespace}`;
  try {
    fsa.rmdirSync(tmpDirectory);
  } catch (e) {}
  fsa.mkdirpSync(tmpDirectory);

  const savedPaths = {};
  const em = new EventEmitter();

  for (const relativePath in files) {
    const filePath = path.join(tmpDirectory, relativePath);
    fsa.mkdirpSync(path.dirname(filePath));
    fsa.writeFileSync(filePath, files[relativePath]);
    savedPaths[relativePath] = filePath;
  }

  history.pushState({}, "", "/?file=" + savedPaths["entry.pc"]);

  const port = await getPort();
  const designer = createEditorMachine(
    {
      host: `localhost:${port}`,
      transport: NodeHttpTransport(),
    },
    () => {
      const handleEvent = (event) => {
        em.emit("event", event);
      };
      return {
        handleEvent,
        dispose: () => {},
      };
    }
  )({
    ...DEFAULT_STATE,
    ...initialState,
  });

  const ws = execa.command(
    `${__dirname}/../../../../target/debug/paperclip_cli designer --port=${port}`,
    { cwd: tmpDirectory, stdio: "inherit" }
  );

  const onEvent = (listener: (event: EditorEvent) => void) => {
    em.on("event", listener);
    return () => {
      em.off("event", listener);
    };
  };

  return { designer, onEvent };
};

export const waitForEvent = (eventType: string, workspace: Workspace) => {
  return new Promise((resolve) => {
    const dispose = workspace.onEvent((event) => {
      if (event.type === eventType) {
        dispose();
        resolve(null);
      }
    });
  });
};

export const stringifyFrames = (frames: HTMLElement[]) =>
  frames
    .map((frame) => (frame.childNodes[2] as HTMLDivElement).innerHTML)
    .join("");
