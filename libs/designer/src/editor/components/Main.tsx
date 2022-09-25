import React from "react";
import { useMemo } from "react";
import { createEditorMachine } from "../machine";
import { MachineContext } from "@paperclip-ui/common";
import { Frames } from "./Canvas/Frames";

export const Main = () => {
  const machine = useMemo(() => createEditorMachine({}), []);
  return (
    <MachineContext.Provider value={machine}>
      <Frames />
    </MachineContext.Provider>
  );
};
