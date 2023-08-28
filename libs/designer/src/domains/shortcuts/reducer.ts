import produce from "immer";
import { DesignerEvent } from "../../events";
import {
  DesignerState,
  InsertMode,
  getTargetExprId,
  isSelectableExpr,
  newConvertToComponentPrompt,
  newDesignFilePrompt,
  setTargetExprId,
} from "../../state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import {
  getGlobalShortcuts,
  getKeyboardMenuCommand,
  ShortcutCommand,
} from "./state";
import { getSelectedExprIdSourceId, maybeCenterCanvas } from "../ui/state";

export const shortcutReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case "keyboard/keyDown": {
      const command = getKeyboardMenuCommand(event, getGlobalShortcuts(state));
      return command != null ? handleCommand(state, command) : state;
    }
    case "shortcuts/itemSelected": {
      return handleCommand(state, event.payload.command);
    }
  }
  return state;
};

const handleCommand = (state: DesignerState, command: ShortcutCommand) => {
  switch (command) {
    case ShortcutCommand.InsertElement:
      return produce(state, (newState) => {
        newState.insertMode = InsertMode.Element;
        setTargetExprId(newState, null);
      });
    case ShortcutCommand.InsertText:
      return produce(state, (newState) => {
        newState.insertMode = InsertMode.Text;
        setTargetExprId(newState, null);
      });
    case ShortcutCommand.InsertResource:
      return produce(state, (newState) => {
        newState.insertMode = InsertMode.Resource;
        setTargetExprId(newState, null);
      });
    case ShortcutCommand.ConvertToComponent:
      return produce(state, (newState) => {
        const expr = ast.getExprInfoById(getTargetExprId(state), state.graph);
        newState.prompt = newConvertToComponentPrompt(expr);
      });
    case ShortcutCommand.SearchFiles:
      return produce(state, (newState) => {
        newState.focusOnFileSearch = true;
      });

    case ShortcutCommand.GoToMain:
      state = produce(state, (newState) => {
        const { expr } = ast.getExprByVirtId(
          getTargetExprId(state),
          state.graph
        );
        setTargetExprId(newState, getSelectedExprIdSourceId(state));
      });

      state = maybeCenterCanvas(state, true);
      return state;
    case ShortcutCommand.ShowHideUI:
      return produce(state, (newState) => {
        newState.showLeftSidebar = newState.showRightsidebar =
          !newState.showLeftSidebar;
      });
    case ShortcutCommand.CreateDesignFile:
      return produce(state, (newState) => {
        newState.prompt = newDesignFilePrompt();
      });
    case ShortcutCommand.Escape:
      return produce(state, (newState) => {
        newState.insertMode = null;
        newState.showTextEditor = false;
        newState.scopedElementId = null;
        newState.selectedFilePath = null;
      });
    case ShortcutCommand.Delete:
      return produce(state, (newState) => {
        newState.highlightedNodeId = null;
        if (getTargetExprId(state)) {
          const node = ast.getExprByVirtId(getTargetExprId(state), state.graph);
          const parent =
            node && ast.getParentExprInfo(node.expr.id, state.graph);

          if (parent) {
            const parentBody = ast.getChildren(parent);

            const pos = parentBody.findIndex(
              (expr) => expr.expr.id === node.expr.id
            );
            const inc = pos === 0 ? 1 : -1;

            let nextChild =
              trySelecting(parentBody, pos, inc) ||
              trySelecting(parentBody, pos, inc * -1);

            if (nextChild) {
              setTargetExprId(newState, nextChild.expr.id);
            } else {
              setTargetExprId(newState, parent.expr.id);
            }
          } else {
            setTargetExprId(newState, null);
          }
        } else {
          setTargetExprId(newState, null);
        }
      });
  }

  return state;
};

const trySelecting = (parentBody: any[], start: number, inc: number) => {
  let nextPos = start + inc;

  while (nextPos > 0 && nextPos < parentBody.length) {
    const nextChild = parentBody[nextPos];
    nextPos += inc;
    if (nextChild && isSelectableExpr(nextChild)) {
      return nextChild;
    }
  }

  return null;
};
