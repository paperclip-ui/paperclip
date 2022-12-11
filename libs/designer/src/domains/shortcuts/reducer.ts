import { virtHTML } from "@paperclip-ui/proto/lib/virt/html-utils";
import produce from "immer";
import { DesignerEvent } from "../../events";
import { DesignerState, InsertMode } from "../../state";
import { keyboardEvents } from "../keyboard/events";
import { shortcutEvents } from "./events";
import {
  getGlobalShortcuts,
  getKeyboardMenuCommand,
  ShortcutCommand,
} from "./state";

export const shortcutReducer = (state: DesignerState, event: DesignerEvent) => {
  switch (event.type) {
    case keyboardEvents.keyDown.type: {
      const command = getKeyboardMenuCommand(event, getGlobalShortcuts(state));
      return command != null ? handleCommand(state, command) : state;
    }
    case shortcutEvents.itemSelected.type: {
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
        newState.selectedVirtNodeId = null;
      });
    case ShortcutCommand.InsertText:
      return produce(state, (newState) => {
        newState.insertMode = InsertMode.Text;
        newState.selectedVirtNodeId = null;
      });
    case ShortcutCommand.InsertResource:
      return produce(state, (newState) => {
        newState.insertMode = InsertMode.Resource;
        newState.selectedVirtNodeId = null;
      });
    case ShortcutCommand.ShowHideUI:
      return produce(state, (newState) => {
        newState.showLeftSidebar = newState.showRightsidebar =
          !newState.showLeftSidebar;
        console.log(newState.showLeftSidebar);
      });
    case ShortcutCommand.Delete:
      return produce(state, (newState) => {
        if (newState.selectedVirtNodeId) {
          const node = virtHTML.getNodeById(
            newState.selectedVirtNodeId,
            state.currentDocument.paperclip.html
          );
          const parent = virtHTML.getNodeParent(
            node,
            state.currentDocument.paperclip.html
          );
          // const index = parent.children.findIndex(child => (child.element === node || child.textNode === node));
          const nextChild = parent.children.find((child) => {
            const inner = virtHTML.getInnerNode(child);
            return newState.selectedVirtNodeId !== inner.id;
          });

          if (nextChild) {
            newState.selectedVirtNodeId = virtHTML.getInnerNode(nextChild).id;
          } else {
            newState.selectedVirtNodeId = parent.id;
          }
        } else {
          newState.selectedVirtNodeId = null;
        }
      });
  }

  return state;
};
