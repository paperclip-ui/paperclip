import { MenuItem, MenuItemKind } from "../../modules/shortcuts/base";
import { ShortcutEvent, shortcutEvents } from "./events";

export const createNodeShortcuts = (): MenuItem<ShortcutEvent>[] => [
  {
    kind: MenuItemKind.Option,
    label: "Create component",
    shortcut: ["alt", "cmd", "k"],
    event: shortcutEvents.convertToComponent(),
  },
  { kind: MenuItemKind.Divider },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "x"],
    event: shortcutEvents.cut(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "c"],
    event: shortcutEvents.copy(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "v"],
    event: shortcutEvents.paste(),
  },
];

export const getGlobalShortcuts = (): MenuItem<ShortcutEvent>[] => [
  // Tooling
  {
    kind: MenuItemKind.Option,
    label: "Insert Element",
    shortcut: ["e"],
    event: shortcutEvents.convertToComponent(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Insert Text",
    shortcut: ["t"],
    event: shortcutEvents.convertToComponent(),
  },

  { kind: MenuItemKind.Divider },

  // Entity
  {
    kind: MenuItemKind.Option,
    label: "Create component",
    shortcut: ["alt", "cmd", "k"],
    event: shortcutEvents.convertToComponent(),
  },
  { kind: MenuItemKind.Divider },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "x"],
    event: shortcutEvents.cut(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "c"],
    event: shortcutEvents.copy(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "v"],
    event: shortcutEvents.paste(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["cmd", "v"],
    event: shortcutEvents.paste(),
  },
  {
    kind: MenuItemKind.Option,
    label: "Cut",
    shortcut: ["delete"],
    event: shortcutEvents.paste(),
  },
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
