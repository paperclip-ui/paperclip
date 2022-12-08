export enum MenuItemKind {
  Divider,
  Option,
  Group,
}

export type BaseMenuItem<TKind extends MenuItemKind> = {
  kind: TKind;
};

export type MenuItemDivider = BaseMenuItem<MenuItemKind.Divider>;

export type MenuItemOption<TCommand> = {
  label: string;
  shortcut?: string[];
  command: TCommand;
  enabled?: boolean;
} & BaseMenuItem<MenuItemKind.Option>;

export type MenuItemGroup<TEvent> = {
  label: string;
  items: MenuItem<TEvent>[];
} & BaseMenuItem<MenuItemKind.Group>;

export type MenuItem<TCommand> =
  | MenuItemDivider
  | MenuItemOption<TCommand>
  | MenuItemGroup<TCommand>;

export type Menu<TCommand> = {
  items: MenuItem<TCommand>[];
};
