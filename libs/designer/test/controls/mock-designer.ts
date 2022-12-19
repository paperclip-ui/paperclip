import { createEditorMachine } from "../../src/machine";
import { DEFAULT_STATE, DesignerState } from "../../src/state";
import getPort from "get-port";
import { DesignerEvent } from "../../src/events";
import { EventEmitter } from "events";
import { NodeHttpTransport } from "@improbable-eng/grpc-web-node-http-transport";
import { Machine } from "@paperclip-ui/common";
import { startWorkspace } from "@paperclip-ui/workspace/lib/test_utils";
import { DesignerClientImpl } from "@paperclip-ui/proto/lib/generated/service/designer";
import { createHistory } from "@paperclip-ui/designer/src/domains/history/history";

export type Designer = {
  onEvent(listener: (event: DesignerEvent) => void): () => void;
  machine: Machine<DesignerState, DesignerEvent>;
  dispose: () => void;
  getClient: () => DesignerClientImpl;
  localFilePaths: Record<string, string>;
};

export const startDesigner = async (
  files: Record<string, string>,
  initialState: Partial<DesignerState> = {},
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
      history: createHistory(),
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

  const onEvent = (listener: (event: DesignerEvent) => void) => {
    em.on("event", listener);
    return () => {
      em.off("event", listener);
    };
  };

  const dispose = () => {
    workspace.dispose();
  };

  return {
    machine,
    onEvent,
    dispose,
    getClient: workspace.getClient,
    localFilePaths: workspace.localFilesPaths,
  };
};
