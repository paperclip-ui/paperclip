import * as React from "react";
import SpacingPaneController0, {
  Props as SpacingPaneController0Props,
} from "./spacing-2-controller";
import SpacingInputController0, {
  Props as SpacingInputController0Props,
} from "./spacing-input-controller";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import {
  _d2bdce074664Props,
  _49786f441973Props,
  _af62926b2310Props,
} from "./inputs/view.pc";
import { _50e32bec2591Props } from "../../../../../../inputs/dropdown/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseSpacingPaneProps = {
  paneProps?: _b6c162d113Props;
  boxSizingInputProps: _d2bdce074664Props;
  marginInputProps: _cbddcb6911222Props;
  paddingInputProps: _cbddcb6911849Props;
} & ElementProps;

export type _cbddcb698077Props = SpacingPaneController0Props;
export const SpacingPane: (
  props: SpacingPaneController0Props
) => React.ReactElement<SpacingPaneController0Props>;

export type BaseMarginInputProps = {} & _cbddcb698678Props & _49786f441973Props;

export type _cbddcb6911222Props = BaseMarginInputProps;

export const MarginInput: (
  props: BaseMarginInputProps
) => React.ReactElement<BaseMarginInputProps>;

export type BasePaddingInputProps = {} & _cbddcb698678Props &
  _49786f441973Props;

export type _cbddcb6911849Props = BasePaddingInputProps;

export const PaddingInput: (
  props: BasePaddingInputProps
) => React.ReactElement<BasePaddingInputProps>;

export type BaseSpacingInputProps = {
  slot?: any;
  topInputProps: _af62926b2310Props;
  rightInputProps: _af62926b2310Props;
  bottomInputProps: _af62926b2310Props;
  leftInputProps: _af62926b2310Props;
  primaryInputProps: _af62926b2310Props;
} & _49786f441973Props;

export type _cbddcb698678Props = SpacingInputController0Props;
export const SpacingInput: (
  props: SpacingInputController0Props
) => React.ReactElement<SpacingInputController0Props>;
