import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseMenuProps = {
  items?: any;
  itemsOuterProps?: ElementProps;
  menuButtonProps?: _22a403a6740Props;
  menuButtonProps1?: _22a403a6740Props;
  menuButtonProps2?: _22a403a6740Props;
} & ElementProps;

export type _22a403a63977Props = BaseMenuProps;

export const Menu: (props: BaseMenuProps) => React.ReactElement<BaseMenuProps>;

export type BaseMenuBarItemProps = {
  variant?: string;
  items?: any;
  activeProps?: ElementProps;
  buttonProps?: _22a403a63903Props;
  optionsContainerProps?: ElementProps;
  optionsProps?: ElementProps;
  optionProps?: _22a403a63903Props;
  optionProps1?: _22a403a63903Props;
  optionProps2?: _22a403a63903Props;
  optionProps3?: _22a403a63903Props;
} & ElementProps;

export type _22a403a6740Props = BaseMenuBarItemProps;

export const MenuBarItem: (
  props: BaseMenuBarItemProps
) => React.ReactElement<BaseMenuBarItemProps>;

export type BaseMenuBarItemOptionProps = {
  variant?: string;
  labelProps?: TextProps;
  activeProps?: ElementProps;
  commandProps?: TextProps;
  hasCommandProps?: ElementProps;
} & ElementProps;

export type _22a403a63903Props = BaseMenuBarItemOptionProps;

export const MenuBarItemOption: (
  props: BaseMenuBarItemOptionProps
) => React.ReactElement<BaseMenuBarItemOptionProps>;
