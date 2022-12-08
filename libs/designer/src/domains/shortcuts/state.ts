import {
  MenuItem,
  MenuItemKind,
  MenuItemOption,
} from "../../modules/shortcuts/base";
import { DesignerEvent } from "../../events";
import { keyboardEvents } from "../keyboard/events";
import { isKeyComboDown } from "./utils";

export enum ShortcutCommand {
  InsertElement,
  InsertText,
  ConvertToComponent,
  Cut,
  Copy,
  Delete,
  Paste,
  Undo,
  Redo,
  Save,
}

export const getEntityShortcuts = (): MenuItem<ShortcutCommand>[] => [
  {
    kind: MenuItemKind.Option,
    label: "Create component",
    shortcut: ["alt", "meta", "k"],
    command: ShortcutCommand.ConvertToComponent,
  },
  { kind: MenuItemKind.Divider },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["meta", "x"],
    command: ShortcutCommand.Cut,
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["meta", "c"],
    command: ShortcutCommand.Copy,
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["meta", "v"],
    command: ShortcutCommand.Paste,
  },
  {
    kind: MenuItemKind.Option,
    label: "Delete",
    shortcut: ["backspace"],
    command: ShortcutCommand.Delete,
  },
];

export const getGlobalShortcuts = (): MenuItem<ShortcutCommand>[] => [
  // Tooling
  {
    kind: MenuItemKind.Option,
    label: "Insert Element",
    shortcut: ["e"],
    command: ShortcutCommand.InsertElement,
  },
  {
    kind: MenuItemKind.Option,
    label: "Insert Text",
    shortcut: ["t"],
    command: ShortcutCommand.InsertText,
  },

  { kind: MenuItemKind.Divider },
  {
    kind: MenuItemKind.Option,
    label: "Redo",
    shortcut: ["meta", "s"],
    command: ShortcutCommand.Save,
  },
  {
    kind: MenuItemKind.Option,
    label: "Undo",
    shortcut: ["meta", "z"],
    command: ShortcutCommand.Undo,
  },
  {
    kind: MenuItemKind.Option,
    label: "Redo",
    shortcut: ["meta", "shift", "z"],
    command: ShortcutCommand.Redo,
  },

  { kind: MenuItemKind.Divider },

  // Entity
  ...getEntityShortcuts(),
];

/*


const useCanvasHotkeys = (ref: MutableRefObject<HTMLElement>) => {
  const dispatch = useDispatch();
  useHotkeys(
    {
      e: () => dispatch(designerEvents.eHotkeyPressed()),
      t: () => dispatch(designerEvents.tHotkeyPressed()),
      backspace: () => dispatch(designerEvents.deleteHokeyPressed()),
      delete: () => dispatch(designerEvents.deleteHokeyPressed()),
      "meta+z": () => dispatch(designerEvents.undoKeyPressed()),
      "meta+shift+z": () => dispatch(designerEvents.redoKeyPressed()),
      "meta+s": () => dispatch(designerEvents.saveKeyComboPressed()),
    },
    ref
  );
};

*/

export const getKeyboardMenuItem = (
  event: ReturnType<typeof keyboardEvents.keyDown>,
  menu: MenuItem<ShortcutCommand>[]
) => {
  return menu.find(
    (item) =>
      item.kind === MenuItemKind.Option &&
      item.shortcut &&
      isKeyComboDown(item.shortcut, event)
  ) as MenuItemOption<ShortcutCommand>;
};

export const getKeyboardMenuCommand = (
  event: ReturnType<typeof keyboardEvents.keyDown>,
  menu: MenuItem<ShortcutCommand>[]
) => {
  return getKeyboardMenuItem(event, menu)?.command;
};
