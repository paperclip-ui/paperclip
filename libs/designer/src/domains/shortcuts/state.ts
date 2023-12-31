import {
  MenuItem,
  MenuItemKind,
  MenuItemOption,
} from "../../modules/shortcuts/base";
import { KeyDown } from "../keyboard/events";
import { isKeyComboDown } from "./utils";
import { DesignerState, getTargetExprId } from "../../state";
import { ast } from "@paperclip-ui/core/lib/src/proto/ast/pc-utils";
import { memoize } from "@paperclip-ui/common";
import { Graph } from "@paperclip-ui/proto/lib/generated/ast/graph";

export enum ShortcutCommand {
  SearchFiles,
  CreateDesignFile,
  CreateDirectory,
  InsertElement,
  GoToMain,
  GoToRenderNodeComponent,
  InsertResource,
  InsertText,
  ZoomIn,
  ZoomOut,
  ConvertToComponent,
  ShowHideUI,
  DeleteFile,
  RenameFile,
  OpenFileInNavigator,
  ConvertToSlot,
  WrapInElement,
  OpenCodeEditor,
  CenterInCanvas,
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

    const isComponent = entity?.kind === ast.ExprKind.Component;

    const renderNodeIsInstance = isComponent
      ? ast.isInstance(ast.getComponentRenderNode(entity.expr).expr, graph)
      : null;

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
      {
        kind: MenuItemKind.Option,
        label: "Center in canvas",
        shortcut: [],
        command: ShortcutCommand.CenterInCanvas,
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

      ...((renderNodeIsInstance
        ? [
            {
              kind: MenuItemKind.Option,
              label: "Go to parent component",
              command: ShortcutCommand.GoToRenderNodeComponent,
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
  {
    kind: MenuItemKind.Option,
    label: "Zoom in",
    shortcut: ["meta", "="],
    command: ShortcutCommand.ZoomIn,
  },
  {
    kind: MenuItemKind.Option,
    label: "Zoom out",
    shortcut: ["meta", "-"],
    command: ShortcutCommand.ZoomOut,
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

    shortcut: ["control", "f"],
    command: ShortcutCommand.SearchFiles,
  },

  { kind: MenuItemKind.Divider },

  // Entity
  ...getSelectedEntityShortcuts(state),
];

export const getFileShortcuts = (
  state: DesignerState
): MenuItem<ShortcutCommand>[] => {
  const isDir = !state.selectedFilePath?.split("/").pop().includes(".");

  return [
    // Tooling
    {
      kind: MenuItemKind.Option,
      label: "Delete File",
      shortcut: [],
      command: ShortcutCommand.DeleteFile,
    },
    {
      kind: MenuItemKind.Option,
      label: "Rename File",
      shortcut: [],
      command: ShortcutCommand.RenameFile,
    },
    ...(isDir
      ? [
          {
            kind: MenuItemKind.Option,
            label: "Open In File Navigator",
            shortcut: [],
            command: ShortcutCommand.OpenFileInNavigator,
          },
          {
            kind: MenuItemKind.Option,
            label: "Create Design File",
            shortcut: [],
            command: ShortcutCommand.CreateDesignFile,
          },
          {
            kind: MenuItemKind.Option,
            label: "Create Directory",
            shortcut: [],
            command: ShortcutCommand.CreateDirectory,
          },
        ]
      : []),
  ].filter(Boolean) as MenuItem<ShortcutCommand>[];
};

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
