import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBannerProps = {
  variant?: string;
  textProps?: TextProps;
  warningProps?: ElementProps;
} & ElementProps;

export type _67d74e287Props = BaseBannerProps;

export const Banner: (
  props: BaseBannerProps
) => React.ReactElement<BaseBannerProps>;
