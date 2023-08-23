import React from "react";
import { useMemo } from "react";
import { createEditorMachine } from "../machine";
import { MachineContext, useSelector } from "@paperclip-ui/common";
import { DEFAULT_STATE, getRenderedFilePath } from "../state/core";
import { env } from "../env";
import { Editor } from "./Editor";
import { HTML5Backend } from "react-dnd-html5-backend";
import { DndProvider } from "react-dnd";
import { Dashboard } from "./Dashboard";
import { HistoryContext } from "../domains/history/react";
import { createHistory } from "../domains/history/history";

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
          <Inner />
        </MachineContext.Provider>
      </HistoryContext.Provider>
    </DndProvider>
  );
};

const Inner = () => {
  const { currentFilePath } = useInner();

  if (currentFilePath) {
    return <Editor />;
  }

  return <Dashboard />;
};

const useInner = () => {
  const currentFilePath = useSelector(getRenderedFilePath);
  return { currentFilePath };
};
