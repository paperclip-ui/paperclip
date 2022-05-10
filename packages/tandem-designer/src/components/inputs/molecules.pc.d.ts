import * as React from "react";
import { _7149f8199122Props } from "./text/view.pc";
import { _9f364d2139415Props } from "./button/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseLabeledInputProps = {
  label?: any;
  input?: any;
  elementProps?: ElementProps;
  textProps?: TextProps;
  inputProps?: ElementProps;
  projectNameInputProps: _7149f8199122Props;
} & ElementProps;

export type _7149f8192509Props = BaseLabeledInputProps;

export const LabeledInput: (
  props: BaseLabeledInputProps
) => React.ReactElement<BaseLabeledInputProps>;

export type BaseTooltipProps = {
  variant?: string;
  content?: any;
  arrowContainerProps?: ElementProps;
  arrowProps?: ElementProps;
  cardProps?: ElementProps;
  contentWrapperProps?: ElementProps;
  textProps?: TextProps;
  rightProps?: ElementProps;
} & ElementProps;

export type _936f2927707Props = BaseTooltipProps;

export const Tooltip: (
  props: BaseTooltipProps
) => React.ReactElement<BaseTooltipProps>;
