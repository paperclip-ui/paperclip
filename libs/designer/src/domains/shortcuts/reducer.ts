import { virtHTML } from "@paperclip-ui/proto-ext/lib/virt/html-utils";
import produce from "immer";
import { DesignerEvent } from "../../events";
import {
  DesignerState,
  InsertMode,
  findVirtNode,
  isSelectableExpr,
} from "../../state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import {
  getGlobalShortcuts,
  getKeyboardMenuCommand,
  ShortcutCommand,
} from "./state";
import { DocumentBodyItem } from "@paperclip-ui/proto/lib/generated/ast/pc";

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
        newState.selectedTargetId = null;
      });
    case ShortcutCommand.InsertText:
      return produce(state, (newState) => {
        newState.insertMode = InsertMode.Text;
        newState.selectedTargetId = null;
      });
    case ShortcutCommand.InsertResource:
      return produce(state, (newState) => {
        newState.insertMode = InsertMode.Resource;
        newState.selectedTargetId = null;
      });

    case ShortcutCommand.GoToMainComponent:
      return produce(state, (newState) => {
        const expr = ast.getExprById(state.selectedTargetId, state.graph);
        const component = ast.getInstanceComponent(expr, state.graph);
        const renderNode = ast.getComponentRenderNode(component);

        // TODO: need to open the document
        newState.selectedTargetId = renderNode?.expr.id ?? component.id;
      });
    case ShortcutCommand.ShowHideUI:
      return produce(state, (newState) => {
        newState.showLeftSidebar = newState.showRightsidebar =
          !newState.showLeftSidebar;
      });
    case ShortcutCommand.Escape:
      return produce(state, (newState) => {
        newState.insertMode = null;
        newState.showTextEditor = false;
        newState.scopedElementId = null;
      });
    case ShortcutCommand.Delete:
      return produce(state, (newState) => {
        newState.highlightedNodeId = null;
        if (newState.selectedTargetId) {
          const node = ast.getExprByVirtId(
            newState.selectedTargetId,
            state.graph
          );
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
              newState.selectedTargetId = nextChild.expr.id;
            } else {
              newState.selectedTargetId = parent.expr.id;
            }
          } else {
            newState.selectedTargetId = null;
          }
        } else {
          newState.selectedTargetId = null;
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
