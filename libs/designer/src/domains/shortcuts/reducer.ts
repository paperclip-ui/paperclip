import { virtHTML } from "@paperclip-ui/proto/lib/virt/html-utils";
import produce from "immer";
import { DesignerEvent } from "../../events";
import { DesignerState, InsertMode } from "../../state";
import {
  getGlobalShortcuts,
  getKeyboardMenuCommand,
  ShortcutCommand,
} from "./state";

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
        if (newState.selectedTargetId) {
          const node = virtHTML.getNodeById(
            newState.selectedTargetId,
            state.currentDocument.paperclip.html
          );
          const parent =
            node &&
            virtHTML.getNodeParent(node, state.currentDocument.paperclip.html);

          if (parent) {
            // const index = parent.children.findIndex(child => (child.element === node || child.textNode === node));
            const nextChild = parent.children.find((child) => {
              const inner = virtHTML.getInnerNode(child);
              return newState.selectedTargetId !== inner.id;
            });

            if (nextChild) {
              newState.selectedTargetId = virtHTML.getInnerNode(nextChild).id;
            } else {
              newState.selectedTargetId = parent.id;
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
