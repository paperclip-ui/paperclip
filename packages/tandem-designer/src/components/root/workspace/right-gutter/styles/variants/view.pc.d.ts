import * as React from "react";
import StyleSwitcherController0, {
  Props as StyleSwitcherController0Props,
} from "./controller2";
import {
  _d30286e83385Props,
  _9f7a77048356Props,
  _f27782548182Props,
} from "../../../../../../icons/view.pc";
import { _50e32bec2591Props } from "../../../../../inputs/dropdown/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseStyleSwitcherProps = {
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  removeStyleButtonProps?: _d30286e83385Props;
  editNameButtonProps?: _9f7a77048356Props;
  addStyleButtonProps?: _f27782548182Props;
  dropdownProps: _50e32bec2591Props;
} & ElementProps;

export type _2ea220e26239Props = StyleSwitcherController0Props;
export const StyleSwitcher: (
  props: StyleSwitcherController0Props
) => React.ReactElement<StyleSwitcherController0Props>;
