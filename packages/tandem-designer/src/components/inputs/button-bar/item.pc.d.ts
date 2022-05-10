import * as React from "react";
import { _38fc2a472503Props } from "../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseButtonBarItemProps = {
  variant?: string;
  icon?: any;
  iconProps?: _38fc2a472503Props;
  lastProps?: ElementProps;
  selectedProps?: ElementProps;
  firstProps?: ElementProps;
} & ElementProps;

export type _6489655782851Props = BaseButtonBarItemProps;

export const ButtonBarItem: (
  props: BaseButtonBarItemProps
) => React.ReactElement<BaseButtonBarItemProps>;
