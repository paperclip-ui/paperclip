import React from "react";
import { useMemo } from "react";
import { createEditorMachine } from "../machine";
import { MachineContext } from "@paperclip-ui/common";
import { Frames } from "./Canvas/Frames";
import { DEFAULT_STATE } from "../machine/state";
import { Canvas } from "./Canvas";
import { env } from "../env";

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
      <Canvas />
    </MachineContext.Provider>
  );
};
