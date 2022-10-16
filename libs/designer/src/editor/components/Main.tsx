import React from "react";
import { useMemo } from "react";
import { createEditorMachine } from "../machine";
import { MachineContext } from "@paperclip-ui/common";
import { Frames } from "./Canvas/Frames";
import { DEFAULT_STATE } from "../machine/state";
import { Canvas } from "./Canvas";

export const Main = () => {
  const machine = useMemo(() => createEditorMachine(DEFAULT_STATE), []);
  return (
    <MachineContext.Provider value={machine}>
      <Canvas />
    </MachineContext.Provider>
  );
};
