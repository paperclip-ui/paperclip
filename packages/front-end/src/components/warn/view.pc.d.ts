import * as React from "react";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseExperimentalWarningProps = {
  elementProps?: ElementProps;
  textProps?: TextProps;
} & ElementProps;

export type _5f48853331665Props = BaseExperimentalWarningProps;

export const ExperimentalWarning: (
  props: BaseExperimentalWarningProps
) => React.ReactElement<BaseExperimentalWarningProps>;
