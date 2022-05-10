import * as React from "react";
import InheritController0, {
  Props as InheritController0Props,
} from "./inherit-controller";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import {
  _d30286e83385Props,
  _f27782548182Props,
} from "../../../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseInheritProps = {
  variant?: string;
  items?: any;
  hasItemSelectedProps?: ElementProps;
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  removeButtonProps?: _d30286e83385Props;
  addButtonProps?: _f27782548182Props;
} & _b6c162d113Props;

export type _9e4a45489771Props = InheritController0Props;
export const Inherit: (
  props: InheritController0Props
) => React.ReactElement<InheritController0Props>;
