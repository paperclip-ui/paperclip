import * as React from "react";
import BoxShadowItemController0, {
  Props as BoxShadowItemController0Props,
} from "./box-shadow-item-controller";
import { _d30286e83385Props } from "../../../../../../../icons/view.pc";
import { _d227ff68826768Props } from "../../../../../../inputs/color/view.pc";
import { _7149f8199122Props } from "../../../../../../inputs/text/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseBoxShadowItemProps = {
  variant?: string;
  inputsProps?: ElementProps;
  removeButtonProps?: _d30286e83385Props;
  colorInputProps: _d227ff68826768Props;
  xInputProps: _7149f8199122Props;
  yInputProps: _7149f8199122Props;
  blurInputProps: _7149f8199122Props;
  spreadInputProps: _7149f8199122Props;
  selectedProps?: ElementProps;
  hoveringProps?: ElementProps;
} & ElementProps;

export type _3fb9d47e20Props = BoxShadowItemController0Props;
export const BoxShadowItem: (
  props: BoxShadowItemController0Props
) => React.ReactElement<BoxShadowItemController0Props>;
