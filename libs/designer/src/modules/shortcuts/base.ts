export enum MenuItemKind {
  Divider,
  Option,
  Group,
}

export type BaseMenuItem<TKind extends MenuItemKind> = {
  kind: TKind;
};

export type MenuItemDivider = BaseMenuItem<MenuItemKind.Divider>;

export type MenuItemOption<TEvent> = {
  label: string;
  shortcut?: string[];
  event: TEvent;
  enabled?: boolean;
} & BaseMenuItem<MenuItemKind.Option>;

export type MenuItemGroup<TEvent> = {
  label: string;
  items: MenuItem<TEvent>[];
} & BaseMenuItem<MenuItemKind.Group>;

export type MenuItem<TEvent> =
  | MenuItemDivider
  | MenuItemOption<TEvent>
  | MenuItemGroup<TEvent>;

export type Menu<TEvent> = {
  items: MenuItem<TEvent>[];
};
