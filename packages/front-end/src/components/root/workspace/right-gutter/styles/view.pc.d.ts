import * as React from "react";
import StylesController0, {
  Props as StylesController0Props
} from "./controller";
import {
  _230a1e127813Props,
  _98d3a3ab395Props
} from "../../../../../icons/view.pc";
import { _2ea220e26239Props } from "./variants/view.pc";
import { _4e40c2b98546Props } from "./behavior/view.pc";
import { _2399b467Props } from "./pretty/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseStylesProps = {
  variant?: string;
  topProps?: ElementProps;
  tabBarProps?: ElementProps;
  elementProps?: ElementProps;
  propertiesTextProps?: TextProps;
  trigggersTextProps?: TextProps;
  toolsProps?: ElementProps;
  propertiesTabButtonProps?: ElementProps;
  iconProps?: _230a1e127813Props;
  triggersTabButtonProps?: ElementProps;
  iconProps1?: _98d3a3ab395Props;
  styleSwitcherProps: _2ea220e26239Props;
  tabsProps?: ElementProps;
  behaviorProps: _4e40c2b98546Props;
  propertiesProps: _2399b467Props;
  propertiesTabProps?: ElementProps;
  triggersTabProps?: ElementProps;
  showPropertiesTabProps?: ElementProps;
} & ElementProps;

export type _45055e8e9Props = StylesController0Props;
export const Styles: (
  props: StylesController0Props
) => React.ReactElement<StylesController0Props>;
