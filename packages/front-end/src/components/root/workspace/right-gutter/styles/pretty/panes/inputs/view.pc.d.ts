import * as React from "react";
import CssMeasurementInputController0, {
  Props as CssMeasurementInputController0Props
} from "./style-value-controller";
import CssDropdownInputController0, {
  Props as CssDropdownInputController0Props
} from "./dropdown-controller";
import LabeledCssInputController0, {
  Props as LabeledCssInputController0Props
} from "./labeled-input-controller";
import TblrInputController0, {
  Props as TblrInputController0Props
} from "./tblr-input-controller";
import InlineLabeledInputController0, {
  Props as InlineLabeledInputController0Props
} from "./inline-labeled-input-controller";
import BackgroundInputController0, {
  Props as BackgroundInputController0Props
} from "./background-input-controller";
import { _7149f8199122Props } from "../../../../../../../inputs/text/view.pc";
import { _50e32bec2591Props } from "../../../../../../../inputs/dropdown/view.pc";
import { _7149f8192509Props } from "../../../../../../../inputs/molecules.pc";
import {
  _8bf103e218Props,
  _8bf103e27Props,
  _993f9ad81121Props
} from "../../../../../../../../icons/view.pc";
import { _6489655782833Props } from "../../../../../../../inputs/button-bar/view.pc";
import { _6489655782851Props } from "../../../../../../../inputs/button-bar/item.pc";
import { _d227ff68826768Props } from "../../../../../../../inputs/color/view.pc";
import { _feaf302b1678Props } from "./background/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseCssMeasurementInputProps = {} & _7149f8199122Props;

export type _a329dd6d16879Props = CssMeasurementInputController0Props;
export const CssMeasurementInput: (
  props: CssMeasurementInputController0Props
) => React.ReactElement<CssMeasurementInputController0Props>;

export type BaseCssDropdownInputProps = {} & _50e32bec2591Props;

export type _d2bdce074664Props = CssDropdownInputController0Props;
export const CssDropdownInput: (
  props: CssDropdownInputController0Props
) => React.ReactElement<CssDropdownInputController0Props>;

export type BaseLabeledCssInputProps = {
  variant?: string;
  input?: any;
  inheritedProps?: ElementProps;
  textInputProps: _7149f8199122Props;
  labelProps?: TextProps;
} & _7149f8192509Props;

export type _82e036ac7328Props = LabeledCssInputController0Props;
export const LabeledCssInput: (
  props: LabeledCssInputController0Props
) => React.ReactElement<LabeledCssInputController0Props>;

export type BaseCssInputRowProps = {
  label?: any;
  input?: any;
  leftProps?: ElementProps;
  textProps?: TextProps;
  rightProps?: ElementProps;
  textInputProps: _7149f8199122Props;
} & ElementProps;

export type _488ffe1f6704Props = BaseCssInputRowProps;

export const CssInputRow: (
  props: BaseCssInputRowProps
) => React.ReactElement<BaseCssInputRowProps>;

export type BaseTblrInputProps = {
  variant?: string;
  primaryInput?: any;
  firstIcon?: any;
  connectedIcon?: any;
  disconnectedIcon?: any;
  firstInput?: any;
  secondInput?: any;
  secondIcon?: any;
  thirdInput?: any;
  thirdIcon?: any;
  fourthInput?: any;
  fourthIcon?: any;
  elementProps?: ElementProps;
  labeledInputProps?: _7149f8192509Props;
  elementProps1?: ElementProps;
  primaryInputContainerProps?: ElementProps;
  primaryInputProps: _af62926b2310Props;
  bordersIconProps?: _8bf103e218Props;
  overlayProps?: ElementProps;
  togglerProps: _6489655782833Props;
  buttonBarItemProps?: _6489655782851Props;
  emptySquareIconProps?: _8bf103e27Props;
  buttonBarItemProps1?: _6489655782851Props;
  bordersIconProps1?: _993f9ad81121Props;
  elementProps2?: ElementProps;
  firstOuterProps?: ElementProps;
  firstInputProps: _af62926b2310Props;
  bordersIconProps2?: _8bf103e218Props;
  secondOuterProps?: ElementProps;
  secondInputProps: _af62926b2310Props;
  bottomInputIconProps?: _8bf103e218Props;
  thirdOuterProps?: ElementProps;
  thirdInputProps: _af62926b2310Props;
  bordersIconProps3?: _8bf103e218Props;
  fourthOuterProps?: ElementProps;
  fourthInputProps: _af62926b2310Props;
  bordersIconProps4?: _8bf103e218Props;
  connectedProps?: ElementProps;
  disconnectedProps?: ElementProps;
} & ElementProps;

export type _49786f441973Props = TblrInputController0Props;
export const TblrInput: (
  props: TblrInputController0Props
) => React.ReactElement<TblrInputController0Props>;

export type BaseInlineLabeledInputProps = {
  variant?: string;
  input?: any;
  icon?: any;
  elementProps?: ElementProps;
  textInputProps: _7149f8199122Props;
  iconContainerProps?: ElementProps;
  bordersIconProps?: _8bf103e218Props;
  focusProps?: ElementProps;
  disabledProps?: ElementProps;
} & ElementProps;

export type _af62926b2310Props = InlineLabeledInputController0Props;
export const InlineLabeledInput: (
  props: InlineLabeledInputController0Props
) => React.ReactElement<InlineLabeledInputController0Props>;

export type BaseBackgroundInputProps = {
  backgroundPickerProps: _feaf302b1678Props;
} & _d227ff68826768Props;

export type _5b0f4e2a2138Props = BackgroundInputController0Props;
export const BackgroundInput: (
  props: BackgroundInputController0Props
) => React.ReactElement<BackgroundInputController0Props>;
