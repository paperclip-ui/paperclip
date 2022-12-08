import React from "react";
import { useMemo } from "react";
import { createEditorMachine } from "../machine";
import { MachineContext } from "@paperclip-ui/common";
import { DEFAULT_STATE } from "../state/core";
import { env } from "../env";
import { Editor } from "./Editor";

export const Main = () => {
  const machine = useMemo(
    () =>
      createEditorMachine({
        protocol: env.protocol,
        host: env.host,
      })(DEFAULT_STATE),
    []
  );
  return (
    <MachineContext.Provider value={machine}>
      <Editor />
    </MachineContext.Provider>
  );
};
