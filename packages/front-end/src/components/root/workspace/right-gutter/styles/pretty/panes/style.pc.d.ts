import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseStylePaneProps = {
  inheritItems?: any;
  elementProps?: ElementProps;
  elementProps1?: ElementProps;
  textProps?: TextProps;
} & ElementProps;

export type _a06d2e814827Props = BaseStylePaneProps;

export const StylePane: (
  props: BaseStylePaneProps
) => React.ReactElement<BaseStylePaneProps>;

export type BaseInheritItemProps = {
  elementProps?: ElementProps;
} & ElementProps;

export type _a06d2e813366Props = BaseInheritItemProps;

export const InheritItem: (
  props: BaseInheritItemProps
) => React.ReactElement<BaseInheritItemProps>;
