import * as React from "react";
import OpacityPaneController0, {
  Props as OpacityPaneController0Props
} from "./opacity-controller";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import { _956880c910105Props } from "../../../../../../inputs/slider/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseOpacityPaneProps = {
  sliderInputProps: _956880c910105Props;
} & _b6c162d113Props;

export type _ab9eb3a110017Props = OpacityPaneController0Props;
export const OpacityPane: (
  props: OpacityPaneController0Props
) => React.ReactElement<OpacityPaneController0Props>;
