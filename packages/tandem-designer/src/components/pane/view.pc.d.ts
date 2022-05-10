import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BasePaneProps = {
  variant?: string;
  header?: any;
  content?: any;
  titleProps?: ElementProps;
  textProps?: TextProps;
  contentProps?: ElementProps;
  innerProps?: TextProps;
  leftProps?: ElementProps;
  rightProps?: ElementProps;
} & ElementProps;

export type _b6c162d113Props = BasePaneProps;

export const Pane: (props: BasePaneProps) => React.ReactElement<BasePaneProps>;
