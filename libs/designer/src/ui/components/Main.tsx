import React from "react";
import { useMemo } from "react";
import { createEditorMachine } from "../../machine";
import { MachineContext } from "@paperclip-ui/common";
import { DEFAULT_STATE } from "../../state/core";
import { env } from "../../env";
import { Editor } from "./Editor";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { HistoryContext } from "../../domains/history/react";
import { createHistory } from "../../domains/history/history";
import { PromptContainer } from "./Prompt";
import { ConfirmContainer } from "./Confirm";

export const Main = () => {
  const { history, machine } = useMemo(() => {
    const history = createHistory();
    const machine = createEditorMachine({
      protocol: env.protocol,
      host: env.host,
      history,
    })(DEFAULT_STATE);

    return { history, machine };
  }, []);
  return (
    <DndProvider backend={HTML5Backend}>
      <HistoryContext.Provider value={history}>
        <MachineContext.Provider value={machine}>
          <Editor />
          <PromptContainer />
          <ConfirmContainer />
        </MachineContext.Provider>
      </HistoryContext.Provider>
    </DndProvider>
  );
};
