import * as React from "react";
import SidePanelButtonController0, {
  Props as SidePanelButtonController0Props
} from "./button-controller";
import { _9b7b527f175442Props } from "../popover/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseSidePanelProps = {
  variant?: string;
  content?: any;
  closeButtonProps?: TextProps;
  leftProps?: ElementProps;
  rightProps?: ElementProps;
  contentProps?: ElementProps;
  contentProps1?: TextProps;
} & ElementProps;

export type _5673c5c2846Props = BaseSidePanelProps;

export const SidePanel: (
  props: BaseSidePanelProps
) => React.ReactElement<BaseSidePanelProps>;

export type BaseSidePanelButtonProps = {
  button?: any;
  content?: any;
  popoverProps: _9b7b527f175442Props;
  buttonOuterProps?: ElementProps;
  textProps?: TextProps;
} & ElementProps;

export type _5673c5c21327Props = SidePanelButtonController0Props;
export const SidePanelButton: (
  props: SidePanelButtonController0Props
) => React.ReactElement<SidePanelButtonController0Props>;
