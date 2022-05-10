import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseDropdownMenuItemProps = {
  variant?: string;
  textProps?: TextProps;
  altProps?: ElementProps;
  specialProps?: ElementProps;
} & ElementProps;

export type _8b8bbe2c859177Props = BaseDropdownMenuItemProps;

export const DropdownMenuItem: (
  props: BaseDropdownMenuItemProps
) => React.ReactElement<BaseDropdownMenuItemProps>;
