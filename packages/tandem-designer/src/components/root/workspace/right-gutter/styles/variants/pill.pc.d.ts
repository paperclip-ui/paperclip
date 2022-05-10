import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseVariantPillProps = {
  variant?: string;
  textProps?: TextProps;
  emptyProps?: ElementProps;
} & ElementProps;

export type _2c32917123Props = BaseVariantPillProps;

export const VariantPill: (
  props: BaseVariantPillProps
) => React.ReactElement<BaseVariantPillProps>;
