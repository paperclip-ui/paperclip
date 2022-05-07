import * as React from "react";
import ContextMenuController0, {
  Props as ContextMenuController0Props
} from "./controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseContextMenuProps = {} & ElementProps;

export type _8c06472162847Props = ContextMenuController0Props;
export const ContextMenu: (
  props: ContextMenuController0Props
) => React.ReactElement<ContextMenuController0Props>;

export type BaseContextMenuItemProps = {
  variant?: string;
  textProps?: TextProps;
  selectedProps?: ElementProps;
} & ElementProps;

export type _8c064721397691Props = BaseContextMenuItemProps;

export const ContextMenuItem: (
  props: BaseContextMenuItemProps
) => React.ReactElement<BaseContextMenuItemProps>;

export type BaseDividerProps = {} & ElementProps;

export type _8c0647211142703Props = BaseDividerProps;

export const Divider: (
  props: BaseDividerProps
) => React.ReactElement<BaseDividerProps>;
