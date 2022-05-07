import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseButtonProps = {
  variant?: string;
  textProps?: TextProps;
  secondaryProps?: ElementProps;
  disabledProps?: ElementProps;
} & ElementProps;

export type _9f364d2139415Props = BaseButtonProps;

export const Button: (
  props: BaseButtonProps
) => React.ReactElement<BaseButtonProps>;
