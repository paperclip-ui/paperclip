import * as React from "react";
import InnerShadowsController0, {
  Props as InnerShadowsController0Props
} from "./box-shadows-inner-controller";
import BoxShadowsController0, {
  Props as BoxShadowsController0Props
} from "./box-shadows-controller";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import {
  _38fc2a476190Props,
  _f27782548182Props
} from "../../../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseOuterShadowsProps = {} & _bcda9fb597619Props & _b6c162d113Props;

export type _cdcf193c15Props = BaseOuterShadowsProps;

export const OuterShadows: (
  props: BaseOuterShadowsProps
) => React.ReactElement<BaseOuterShadowsProps>;

export type BaseInnerShadowsProps = {} & _bcda9fb597619Props & _b6c162d113Props;

export type _cdcf193c18Props = InnerShadowsController0Props;
export const InnerShadows: (
  props: InnerShadowsController0Props
) => React.ReactElement<InnerShadowsController0Props>;

export type BaseBoxShadowsProps = {
  variant?: string;
  hasSelectedShadowProps?: ElementProps;
  hasItemsProps?: ElementProps;
  itemsProps?: ElementProps;
  labelsProps?: ElementProps;
  xProps?: TextProps;
  yProps?: TextProps;
  blurProps?: TextProps;
  spreadProps?: TextProps;
  elementProps?: ElementProps;
  textProps?: TextProps;
  controlsProps?: ElementProps;
  elementProps1?: ElementProps;
  removeButtonProps?: _38fc2a476190Props;
  addButtonProps?: _f27782548182Props;
} & _b6c162d113Props;

export type _bcda9fb597619Props = BoxShadowsController0Props;
export const BoxShadows: (
  props: BoxShadowsController0Props
) => React.ReactElement<BoxShadowsController0Props>;
