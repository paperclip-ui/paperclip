import * as React from "react";
import BackgroundItemController0, {
  Props as BackgroundItemController0Props
} from "./background-item-controller";
import BackgroundsController0, {
  Props as BackgroundsController0Props
} from "./backgrounds-controller";
import {
  _d30286e83385Props,
  _f27782548182Props
} from "../../../../../../../icons/view.pc";
import { _5b0f4e2a2138Props } from "./inputs/view.pc";
import { _d227ff68826768Props } from "../../../../../../inputs/color/view.pc";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import { _50e32bec2591Props } from "../../../../../../inputs/dropdown/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBackgroundItemProps = {
  variant?: string;
  removeButtonProps?: _d30286e83385Props;
  backgroundInputProps: _5b0f4e2a2138Props;
  infoProps?: ElementProps;
  labelProps?: TextProps;
  hoverProps?: ElementProps;
} & ElementProps;

export type _bcda9fb5211066Props = BackgroundItemController0Props;
export const BackgroundItem: (
  props: BackgroundItemController0Props
) => React.ReactElement<BackgroundItemController0Props>;

export type BaseBackgroundsProps = {
  variant?: string;
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  minusButtonProps?: TextProps;
  plusButtonProps?: _f27782548182Props;
  hasBackgroundProps?: ElementProps;
} & _b6c162d113Props;

export type _bcda9fb596963Props = BackgroundsController0Props;
export const Backgrounds: (
  props: BackgroundsController0Props
) => React.ReactElement<BackgroundsController0Props>;

export type BaseBackgroundImageInputProps = {
  displayInputProps: _50e32bec2591Props;
  displayInputProps1: _50e32bec2591Props;
} & ElementProps;

export type _53f5d4a219711Props = BaseBackgroundImageInputProps;

export const BackgroundImageInput: (
  props: BaseBackgroundImageInputProps
) => React.ReactElement<BaseBackgroundImageInputProps>;
