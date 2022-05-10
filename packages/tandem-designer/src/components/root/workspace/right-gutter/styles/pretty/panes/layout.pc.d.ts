import * as React from "react";
import LayoutController0, {
  Props as LayoutController0Props,
} from "./layout-controller";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import { _d2bdce074664Props, _a329dd6d16879Props } from "./inputs/view.pc";
import { _50e32bec2591Props } from "../../../../../../inputs/dropdown/view.pc";
import { _7149f8199122Props } from "../../../../../../inputs/text/view.pc";
import { _7149f8192509Props } from "../../../../../../inputs/molecules.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseLayoutProps = {
  elementProps?: ElementProps;
  textProps?: TextProps;
  displayInputProps: _d2bdce074664Props;
  parentFlexboxControlsProps?: ElementProps;
  flexDirectionInputProps: _d2bdce074664Props;
  flexWrapInputProps: _d2bdce074664Props;
  justifyContentInputProps: _d2bdce074664Props;
  alignItemsInputProps: _d2bdce074664Props;
  alignContentInputProps: _d2bdce074664Props;
  childFlexboxControlsProps?: ElementProps;
  flexBasisInputProps: _a329dd6d16879Props;
  flexGrowInputProps: _a329dd6d16879Props;
  flexShrinkInputProps: _a329dd6d16879Props;
  alignSelfInputProps: _d2bdce074664Props;
  positionProps?: _7149f8192509Props;
  positionInputProps: _d2bdce074664Props;
  moveControlsProps?: ElementProps;
  leftInputProps: _a329dd6d16879Props;
  topInputProps: _a329dd6d16879Props;
  sizeControlsProps?: ElementProps;
  widthInputProps: _a329dd6d16879Props;
  heightInputProps: _a329dd6d16879Props;
  whiteSpaceProps?: _7149f8192509Props;
  whiteSpaceInputProps: _d2bdce074664Props;
} & _b6c162d113Props;

export type _73b39db4544Props = LayoutController0Props;
export const Layout: (
  props: LayoutController0Props
) => React.ReactElement<LayoutController0Props>;
