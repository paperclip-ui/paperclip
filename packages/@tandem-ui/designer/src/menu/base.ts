import { Action } from "redux";

export type MenuItem = {
  label: string;
  keyboardShortcut?: string;
  action?: Action;
  children?: MenuItems;
};

export type MenuItems = Array<MenuItem[] | MenuItem>;

export const eachMenuItem = (
  items: MenuItems | MenuItem,
  each: (item: MenuItem) => void
) => {
  if (Array.isArray(items)) {
    for (const item of items) {
      eachMenuItem(item, each);
    }
  } else {
    each(items);
    if (items.children) {
      for (const child of items.children) {
        eachMenuItem(child, each);
      }
    }
  }
};
