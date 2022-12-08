import { MenuItem, MenuItemKind } from "../../modules/shortcuts/base";
import { DesignerEvent } from "../../events";
import { shortcutEvents } from "./events";

export const createNodeShortcuts = (): MenuItem<DesignerEvent>[] => [
  {
    kind: MenuItemKind.Option,
    label: "Create component",
    shortcut: ["alt", "cmd", "k"],
    event: shortcutEvents.selectedConvertToComponent(),
  },
  { kind: MenuItemKind.Divider },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "x"],
    event: shortcutEvents.selectedCut(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "c"],
    event: shortcutEvents.selectedCopy(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "v"],
    event: shortcutEvents.selectedPaste(),
  },
];

export const getGlobalShortcuts = (): MenuItem<DesignerEvent>[] => [
  ...createNodeShortcuts(),
];
