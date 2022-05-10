import * as React from "react";
import BorderController0, {
  Props as BorderController0Props,
} from "./borders-controller";
import BorderStyleController0, {
  Props as BorderStyleController0Props,
} from "./border-style-controller";
import BorderStylesController0, {
  Props as BorderStylesController0Props,
} from "./border-styles-controller";
import Borders2Controller0, {
  Props as Borders2Controller0Props,
} from "./borders-2-controller";
import RadiusInputController0, {
  Props as RadiusInputController0Props,
} from "./radius-controller";
import ColorsInputController0, {
  Props as ColorsInputController0Props,
} from "./border-color-input-controller";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import {
  _a329dd6d16879Props,
  _49786f441973Props,
  _af62926b2310Props,
} from "./inputs/view.pc";
import { _7149f8199122Props } from "../../../../../../inputs/text/view.pc";
import { _d227ff68826768Props } from "../../../../../../inputs/color/view.pc";
import { _50e32bec2591Props } from "../../../../../../inputs/dropdown/view.pc";
import { _6489655782833Props } from "../../../../../../inputs/button-bar/view.pc";
import {
  _38fc2a479877Props,
  _38fc2a478648Props,
  _38fc2a4712335Props,
  _38fc2a4711106Props,
  _d330cc11286Props,
  _ba6ac0ff8745Props,
} from "../../../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBorderProps = {
  bottomLeftRadiusInputProps: _a329dd6d16879Props;
  topLeftRadiusInputProps: _a329dd6d16879Props;
  topRightRadiusInputProps: _a329dd6d16879Props;
  bottomRightRadiusInputProps: _a329dd6d16879Props;
  borderStylingProps: _7be2457124Props;
  elementProps?: ElementProps;
  textProps?: TextProps;
} & _b6c162d113Props;

export type _52309d3e125631Props = BorderController0Props;
export const Border: (
  props: BorderController0Props
) => React.ReactElement<BorderController0Props>;

export type BaseBorderStyleProps = {
  colorInputProps: _d227ff68826768Props;
  styleInputProps: _50e32bec2591Props;
  thicknessInputProps: _7149f8199122Props;
  elementProps?: ElementProps;
} & ElementProps;

export type _7be245712Props = BorderStyleController0Props;
export const BorderStyle: (
  props: BorderStyleController0Props
) => React.ReactElement<BorderStyleController0Props>;

export type BaseBorderStylesProps = {
  variant?: string;
  elementProps?: ElementProps;
  togglerProps: _6489655782833Props;
  allProps?: ElementProps;
  borderInputProps: _7be245712Props;
  individualProps?: ElementProps;
  borderRightInputProps: _7be245712Props;
  borderBottomInputProps: _7be245712Props;
  borderLeftInputProps: _7be245712Props;
  borderTopInputProps: _7be245712Props;
  allProps1?: ElementProps;
  individualProps1?: ElementProps;
} & ElementProps;

export type _7be2457124Props = BorderStylesController0Props;
export const BorderStyles: (
  props: BorderStylesController0Props
) => React.ReactElement<BorderStylesController0Props>;

export type BaseBorders2Props = {
  paneProps?: _b6c162d113Props;
  radiusInputProps: _1b9666ba6355Props;
  colorInputProps: _1b9666ba6827Props;
} & ElementProps;

export type _af62926b5232Props = Borders2Controller0Props;
export const Borders2: (
  props: Borders2Controller0Props
) => React.ReactElement<Borders2Controller0Props>;

export type BaseRadiusInputProps = {
  topLeftCornerIconProps?: _38fc2a479877Props;
  topRightCornerIconProps?: _38fc2a478648Props;
  bottomRightCornerIconProps?: _38fc2a4712335Props;
  bottomLeftCornerIconProps?: _38fc2a4711106Props;
  primaryInputProps: _af62926b2310Props;
  cornersProps?: _d330cc11286Props;
  topLeftInputProps: _af62926b2310Props;
  cornersProps1?: _d330cc11286Props;
  topRightInputProps: _af62926b2310Props;
  cornersProps2?: _d330cc11286Props;
  bottomRightInputProps: _af62926b2310Props;
  cornersProps3?: _d330cc11286Props;
  bottomLeftInputProps: _af62926b2310Props;
  cornersProps4?: _d330cc11286Props;
  cornersIconProps?: _d330cc11286Props;
  roundSquareIconProps?: _ba6ac0ff8745Props;
} & _49786f441973Props;

export type _1b9666ba6355Props = RadiusInputController0Props;
export const RadiusInput: (
  props: RadiusInputController0Props
) => React.ReactElement<RadiusInputController0Props>;

export type BaseColorsInputProps = {
  topLeftCornerIconProps?: _38fc2a479877Props;
  topRightCornerIconProps?: _38fc2a478648Props;
  bottomRightCornerIconProps?: _38fc2a4712335Props;
  bottomLeftCornerIconProps?: _38fc2a4711106Props;
  topInputProps: _7be245712Props;
  rightInputProps: _7be245712Props;
  bottomInputProps: _7be245712Props;
  leftInputProps: _7be245712Props;
  primaryInputProps: _7be245712Props;
} & _49786f441973Props;

export type _1b9666ba6827Props = ColorsInputController0Props;
export const ColorsInput: (
  props: ColorsInputController0Props
) => React.ReactElement<ColorsInputController0Props>;
