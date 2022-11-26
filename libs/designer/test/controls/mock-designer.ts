import { createEditorMachine } from "../../src/machine";
import { DEFAULT_STATE, EditorState } from "../../src/machine/state";
import getPort from "get-port";
import { EditorEvent } from "../../src/machine/events";
import { EventEmitter } from "events";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import { Machine } from "@paperclip-ui/common";
import { startWorkspace } from "@paperclip-ui/workspace/lib/test_utils";

export type Designer = {
  onEvent(listener: (event: EditorEvent) => void): () => void;
  machine: Machine<EditorState, EditorEvent>;
  dispose: () => void;
};

export const startDesigner = async (
  files: Record<string, string>,
  initialState: Partial<EditorState> = {},
  namespace: string = "tmp-workspace"
): Promise<Designer> => {
  const port = await getPort();
  const workspace = await startWorkspace({
    files,
    namespace,
    port,
  });

  const em = new EventEmitter();

  const machine = createEditorMachine(
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
    history: {
      pathname: "/",
      query: {
        file: workspace.localFilesPaths["entry.pc"],
      },
    },
  });

  const onEvent = (listener: (event: EditorEvent) => void) => {
    em.on("event", listener);
    return () => {
      em.off("event", listener);
    };
  };

  const dispose = () => {
    workspace.dispose();
  };

  return { machine, onEvent, dispose };
};
