import * as React from "react";
import ElementStylerController0, {
  Props as ElementStylerController0Props,
} from "./index";
import { _f657bb0949423Props } from "./panes/instance.pc";
import { _9e4a45489771Props } from "./panes/inherit.pc";
import { _b6c162d113Props } from "../../../../../pane/view.pc";
import { _850332f711267Props } from "./panes/inspector/view.pc";
import { _73b39db4544Props } from "./panes/layout.pc";
import { _73b39db4362Props } from "./panes/typography.pc";
import { _ab9eb3a110017Props } from "./panes/opacity.pc";
import { _af62926b5232Props } from "./panes/borders.pc";
import { _cbddcb698077Props } from "./panes/spacing.pc";
import { _bcda9fb596963Props } from "./panes/backgrounds.pc";
import {
  _cdcf193c15Props,
  _bcda9fb597619Props,
  _cdcf193c18Props,
} from "./panes/box-shadows.pc";
import { _bcda9fb597947Props } from "./panes/filters.pc";
import { _decafdc7265667Props } from "./panes/code.pc";
import { _97a34b151010442Props } from "../../../../../dev/comments.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseElementStylerProps = {
  variant?: string;
  instancePaneProps: _f657bb0949423Props;
  inheritPaneProps: _9e4a45489771Props;
  styleInspectorProps?: _850332f711267Props;
  layoutPaneProps: _73b39db4544Props;
  typographyPaneProps: _73b39db4362Props;
  opacityPaneProps: _ab9eb3a110017Props;
  bordersPaneProps: _af62926b5232Props;
  spacingPaneProps: _cbddcb698077Props;
  backgroundsPaneProps: _bcda9fb596963Props;
  outerShadowsPaneProps: _cdcf193c15Props;
  innerShadowsPaneProps: _cdcf193c18Props;
  innerShadowsPaneProps1?: _bcda9fb597947Props;
  filtersPaneProps?: _bcda9fb597947Props;
  codePaneProps: _decafdc7265667Props;
  inspectorProps?: ElementProps;
} & ElementProps;

export type _2399b467Props = ElementStylerController0Props;
export const ElementStyler: (
  props: ElementStylerController0Props
) => React.ReactElement<ElementStylerController0Props>;
