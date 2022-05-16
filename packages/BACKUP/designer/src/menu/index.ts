import {
  shortcutKeyDown,
  SHORTCUT_R_KEY_DOWN,
  SHORTCUT_C_KEY_DOWN,
  SHORTCUT_T_KEY_DOWN,
  SHORTCUT_DELETE_KEY_DOWN,
} from "../actions";
import { MenuItems } from "./base";

/*

TODO:

- undo
- redo
- copy / paste

*/

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
