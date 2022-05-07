import * as React from "react";
import VariantOptionController0, {
  Props as VariantOptionController0Props
} from "./option-controller";
import { _6f30576e8Props } from "../../../../../inputs/switch/view.pc";
import {
  _98d3a3ab395Props,
  _82eac94a20Props
} from "../../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseVariantOptionProps = {
  variant?: string;
  input?: any;
  elementProps?: ElementProps;
  switchProps: _6f30576e8Props;
  inputProps?: ElementProps;
  labelProps?: TextProps;
  boltIconProps?: _98d3a3ab395Props;
  resetButtonProps?: _82eac94a20Props;
  onProps?: ElementProps;
  altProps?: ElementProps;
  hasTriggerProps?: ElementProps;
  onProps1?: ElementProps;
  triggeredProps?: ElementProps;
} & ElementProps;

export type _1d51efba14Props = VariantOptionController0Props;
export const VariantOption: (
  props: VariantOptionController0Props
) => React.ReactElement<VariantOptionController0Props>;
