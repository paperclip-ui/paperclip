import * as React from "react";
import InstancePaneController0, {
  Props as InstancePaneController0Props,
} from "./instance-pane-controller";
import { _1d51efba14Props } from "../../variants/option.pc";
import { _50e32bec2591Props } from "../../../../../../inputs/dropdown/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseInstancePaneProps = {
  variant?: string;
  content?: any;
  variantOptionProps: _1d51efba14Props;
  variantOptionProps1: _1d51efba14Props;
  variantOptionProps2: _1d51efba14Props;
  variantOptionProps3: _1d51efba14Props;
  elementProps?: ElementProps;
  textProps?: TextProps;
  resetDropdownProps: _50e32bec2591Props;
  hasOverridesProps?: ElementProps;
} & ElementProps;

export type _f657bb0949423Props = InstancePaneController0Props;
export const InstancePane: (
  props: InstancePaneController0Props
) => React.ReactElement<InstancePaneController0Props>;
