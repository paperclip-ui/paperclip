import * as React from "react";
import BuildButtonController0, {
  Props as BuildButtonController0Props,
} from "./build-button-controller";
import { _9b7b527f175442Props } from "../../popover/view.pc";
import {
  _1fb4e79017899Props,
  _1fb4e79017906Props,
} from "../../../icons/view.pc";
import { _936f2927707Props } from "../../inputs/molecules.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBuildButtonProps = {
  variant?: string;
  popoverProps: _9b7b527f175442Props;
  buildButtonProps?: ElementProps;
  playIconProps?: _1fb4e79017899Props;
  pauseIconProps?: _1fb4e79017906Props;
  labelProps?: TextProps;
  tooltipProps?: _936f2927707Props;
  buildButtonMenuProps?: _d8b0f2c217756Props;
  buildingProps?: ElementProps;
  pausedProps?: ElementProps;
} & ElementProps;

export type _fe72344f18313Props = BuildButtonController0Props;
export const BuildButton: (
  props: BuildButtonController0Props
) => React.ReactElement<BuildButtonController0Props>;

export type BaseBuildButtonMenuProps = {
  variant?: string;
  items?: any;
  elementProps?: _def97aeb17794Props;
  elementProps1?: _def97aeb17794Props;
  elementProps2?: _def97aeb17794Props;
  hoverProps?: ElementProps;
} & ElementProps;

export type _d8b0f2c217756Props = BaseBuildButtonMenuProps;

export const BuildButtonMenu: (
  props: BaseBuildButtonMenuProps
) => React.ReactElement<BaseBuildButtonMenuProps>;

export type BaseBuildButtonOptionProps = {
  variant?: string;
  labelProps?: TextProps;
  hoverProps?: ElementProps;
} & ElementProps;

export type _def97aeb17794Props = BaseBuildButtonOptionProps;

export const BuildButtonOption: (
  props: BaseBuildButtonOptionProps
) => React.ReactElement<BaseBuildButtonOptionProps>;
