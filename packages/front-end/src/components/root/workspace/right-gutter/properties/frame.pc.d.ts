import * as React from "react";
import FramePaneController0, {
  Props as FramePaneController0Props
} from "./frame-controller";
import { _50e32bec2591Props } from "../../../../inputs/dropdown/view.pc";
import { _7149f8199122Props } from "../../../../inputs/text/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseFramePaneProps = {
  elementProps?: ElementProps;
  presetInputProps: _50e32bec2591Props;
  elementProps1?: ElementProps;
  xInputProps: _7149f8199122Props;
  yInputProps: _7149f8199122Props;
  elementProps2?: ElementProps;
  widthInputProps: _7149f8199122Props;
  heightInputProps: _7149f8199122Props;
} & ElementProps;

export type _ca37a81113095Props = FramePaneController0Props;
export const FramePane: (
  props: FramePaneController0Props
) => React.ReactElement<FramePaneController0Props>;
