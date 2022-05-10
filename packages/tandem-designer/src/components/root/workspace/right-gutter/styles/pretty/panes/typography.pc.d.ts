import * as React from "react";
import TypographController0, {
  Props as TypographController0Props,
} from "./typography-controller";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import {
  _82e036ac7328Props,
  _d2bdce074664Props,
  _a329dd6d16879Props,
} from "./inputs/view.pc";
import { _7149f8192509Props } from "../../../../../../inputs/molecules.pc";
import { _50e32bec2591Props } from "../../../../../../inputs/dropdown/view.pc";
import { _7149f8199122Props } from "../../../../../../inputs/text/view.pc";
import { _6489655782833Props } from "../../../../../../inputs/button-bar/view.pc";
import { _d227ff68826768Props } from "../../../../../../inputs/color/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTypographProps = {
  fontFamilyInputContainerProps: _82e036ac7328Props;
  familyInputProps: _d2bdce074664Props;
  weightInputContainerProps: _82e036ac7328Props;
  weightInputProps: _d2bdce074664Props;
  decorationInputContainerProps: _82e036ac7328Props;
  decorationInputProps: _d2bdce074664Props;
  lineInputContainerProps: _82e036ac7328Props;
  lineInputProps: _a329dd6d16879Props;
  spacingInputContainerProps: _82e036ac7328Props;
  spacingInputProps: _a329dd6d16879Props;
  alignmentInputContainerProps: _82e036ac7328Props;
  alignmentInputProps: _6489655782833Props;
  elementProps?: ElementProps;
  sizeInputContainerProps: _82e036ac7328Props;
  sizeInputProps: _a329dd6d16879Props;
  colorInputContainerProps: _82e036ac7328Props;
  colorInputProps: _d227ff68826768Props;
  elementProps1?: ElementProps;
  elementProps2?: ElementProps;
  textProps?: TextProps;
} & _b6c162d113Props;

export type _73b39db4362Props = TypographController0Props;
export const Typograph: (
  props: TypographController0Props
) => React.ReactElement<TypographController0Props>;
