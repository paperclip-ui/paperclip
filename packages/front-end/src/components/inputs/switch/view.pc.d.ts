import * as React from "react";
import SwitchController0, {
  Props as SwitchController0Props
} from "./controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseSwitchProps = {
  variant?: string;
  trackProps?: ElementProps;
  dotProps?: ElementProps;
  onProps?: ElementProps;
} & ElementProps;

export type _6f30576e8Props = SwitchController0Props;
export const Switch: (
  props: SwitchController0Props
) => React.ReactElement<SwitchController0Props>;
