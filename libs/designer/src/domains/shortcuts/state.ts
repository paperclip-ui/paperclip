import {
  MenuItem,
  MenuItemKind,
  MenuItemOption,
} from "../../modules/shortcuts/base";
import { KeyDown } from "../keyboard/events";
import { isKeyComboDown } from "./utils";
import { DesignerState } from "../../state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";

export enum ShortcutCommand {
  InsertElement,
  GoToMainComponent,
  InsertResource,
  InsertText,
  ConvertToComponent,
  ShowHideUI,
  ConvertToSlot,
  WrapInElement,
  Cut,
  Copy,
  Delete,
  Escape,
  Paste,
  Undo,
  Redo,
  Save,
}

export const ALLOW_DEFAULTS = [
  ShortcutCommand.Copy,
  ShortcutCommand.Paste,
  ShortcutCommand.Cut,
];

export const getEntityShortcuts = (
  state: DesignerState
): MenuItem<ShortcutCommand>[] => {
  const entity = ast.getExprInfoById(state.selectedTargetId, state.graph);
  const isInstance =
    entity &&
    entity.kind === ast.ExprKind.Element &&
    ast.isInstance(entity.expr, state.graph);

  return [
    {
      kind: MenuItemKind.Option,
      label: "Create component",
      shortcut: ["alt", "meta", "k"],
      command: ShortcutCommand.ConvertToComponent,
    },
    {
      kind: MenuItemKind.Option,
      label: "Convert to slot",
      enabled:
        ast.isExpressionId(state.selectedTargetId) &&
        ast.isExpressionInComponent(state.selectedTargetId, state.graph),
      command: ShortcutCommand.ConvertToSlot,
    },
    {
      kind: MenuItemKind.Option,
      label: "Wrap in element",
      shortcut: ["alt", "shift", "e"],
      command: ShortcutCommand.WrapInElement,
    },
    { kind: MenuItemKind.Divider },
    // Instance specific
    ...((isInstance
      ? [
          {
            kind: MenuItemKind.Option,
            label: "Go to main component",
            command: ShortcutCommand.GoToMainComponent,
          },
          { kind: MenuItemKind.Divider },
        ]
      : []) as MenuItem<ShortcutCommand>[]),
    {
      kind: MenuItemKind.Option,
      label: "Cut",
      shortcut: ["meta", "x"],
      command: ShortcutCommand.Cut,
    },
    {
      kind: MenuItemKind.Option,
      label: "Copy",
      shortcut: ["meta", "c"],
      command: ShortcutCommand.Copy,
    },
    {
      kind: MenuItemKind.Option,
      label: "Paste",
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
};

export const getGlobalShortcuts = (
  state: DesignerState
): MenuItem<ShortcutCommand>[] => [
  // Tooling
  {
    kind: MenuItemKind.Option,
    label: "Show/hide UI",
    shortcut: ["control", "\\"],
    command: ShortcutCommand.ShowHideUI,
  },
  {
    kind: MenuItemKind.Option,
    label: "Escape",
    shortcut: ["escape"],
    command: ShortcutCommand.Escape,
  },
  { kind: MenuItemKind.Divider },
  {
    kind: MenuItemKind.Option,
    label: "Insert Resource",
    shortcut: ["shift", "i"],
    command: ShortcutCommand.InsertResource,
  },
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
  ...getEntityShortcuts(state),
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
  event: KeyDown,
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
  event: KeyDown,
  menu: MenuItem<ShortcutCommand>[]
) => {
  return getKeyboardMenuItem(event, menu)?.command;
};
