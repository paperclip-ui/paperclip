import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseRightGutterTabProps = {
  variant?: string;
  labelProps?: TextProps;
  selectedProps?: ElementProps;
} & ElementProps;

export type _5d7d4069129476Props = BaseRightGutterTabProps;

export const RightGutterTab: (
  props: BaseRightGutterTabProps
) => React.ReactElement<BaseRightGutterTabProps>;
