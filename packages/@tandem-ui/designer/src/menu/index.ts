import {
  shortcutKeyDown,
  SHORTCUT_R_KEY_DOWN,
  SHORTCUT_C_KEY_DOWN,
  SHORTCUT_T_KEY_DOWN,
  SHORTCUT_DELETE_KEY_DOWN,
  OPEN_PROJECT_BUTTON_CLICKED,
  SHORTCUT_QUICK_SEARCH_KEY_DOWN,
  SHORTCUT_SAVE_KEY_DOWN,
  SHORTCUT_ESCAPE_KEY_DOWN,
} from "../actions";
import { MenuItems } from "./base";

/*

TODO:

- undo
- redo
- copy / paste

*/

// const cmdKey = platform() === "win32" ? "ctrl" : "meta";
const cmdKey = "meta";

export const GLOBAL_MENU: MenuItems = [
  {
    label: "Edit",
    children: [
      // Insert instance
      {
        label: "Delete",
        keyboardShortcut: "backspace",
        action: shortcutKeyDown(SHORTCUT_DELETE_KEY_DOWN),
      },
      {
        label: "Escape",
        keyboardShortcut: "escape",
        action: shortcutKeyDown(SHORTCUT_ESCAPE_KEY_DOWN),
      },
    ],
  },
  {
    label: "File",
    children: [
      {
        label: "Save",
        keyboardShortcut: `ctrl+s`,
        action: shortcutKeyDown(SHORTCUT_SAVE_KEY_DOWN),
      },
      {
        label: "Search",
        keyboardShortcut: `ctrl+t`,
        action: shortcutKeyDown(SHORTCUT_QUICK_SEARCH_KEY_DOWN),
      },
      {
        label: "Open Project...",
        keyboardShortcut: `${cmdKey}+o`,
        action: shortcutKeyDown(OPEN_PROJECT_BUTTON_CLICKED),
      },
    ],
  },
  {
    label: "Tool",
    children: [
      // Insert instance
      {
        label: "Insert",
        keyboardShortcut: "c",
        action: shortcutKeyDown(SHORTCUT_C_KEY_DOWN),
      },
      {
        label: "Text",
        keyboardShortcut: "t",
        action: shortcutKeyDown(SHORTCUT_T_KEY_DOWN),
      },
      {
        label: "Element",
        keyboardShortcut: "r",
        action: shortcutKeyDown(SHORTCUT_R_KEY_DOWN),
      },
    ],
  },
];
