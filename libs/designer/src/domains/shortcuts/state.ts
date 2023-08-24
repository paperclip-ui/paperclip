import {
  MenuItem,
  MenuItemKind,
  MenuItemOption,
} from "../../modules/shortcuts/base";
import { KeyDown } from "../keyboard/events";
import { isKeyComboDown } from "./utils";
import { DesignerState, getTargetExprId } from "../../state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { memoize } from "@paperclip-ui/common";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";

export enum ShortcutCommand {
  SearchFiles,
  CreateDesignFile,
  InsertElement,
  GoToMain,
  InsertResource,
  InsertText,
  ConvertToComponent,
  ShowHideUI,
  ConvertToSlot,
  WrapInElement,
  OpenCodeEditor,
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

export const getEntityShortcuts = memoize(
  (id: string, graph: Graph): MenuItem<ShortcutCommand>[] => {
    const entity = ast.getExprInfoById(id, graph);
    const isInstance =
      (id && id.includes(".")) ||
      (entity?.kind === ast.ExprKind.Element &&
        ast.isInstance(entity.expr, graph));

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
          ast.isExpressionId(id) && ast.isExpressionInComponent(id, graph),
        command: ShortcutCommand.ConvertToSlot,
      },
      {
        kind: MenuItemKind.Option,
        label: "Wrap in element",
        shortcut: ["alt", "shift", "e"],
        command: ShortcutCommand.WrapInElement,
      },
      { kind: MenuItemKind.Divider },
      {
        kind: MenuItemKind.Option,
        label: "Open code editor",
        shortcut: ["alt", "shift", "c"],
        command: ShortcutCommand.OpenCodeEditor,
      },
      // Instance specific

      ...((isInstance
        ? [
            {
              kind: MenuItemKind.Option,
              label: "Go to main",
              command: ShortcutCommand.GoToMain,
            },
          ]
        : []) as MenuItem<ShortcutCommand>[]),
      { kind: MenuItemKind.Divider },
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
    ].filter(Boolean) as MenuItem<any>[];
  }
);

export const getSelectedEntityShortcuts = (
  state: DesignerState
): MenuItem<ShortcutCommand>[] =>
  getEntityShortcuts(getTargetExprId(state), state.graph);

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
  {
    kind: MenuItemKind.Option,
    label: "Create Design File",
    shortcut: ["meta", "shift", "n"],
    command: ShortcutCommand.CreateDesignFile,
  },
  {
    kind: MenuItemKind.Option,
    label: "Search Files",
    shortcut: ["meta", "shift", "f"],
    command: ShortcutCommand.SearchFiles,
  },

  { kind: MenuItemKind.Divider },

  // Entity
  ...getSelectedEntityShortcuts(state),
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
