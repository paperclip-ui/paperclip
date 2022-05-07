import * as React from "react";
import SliderController0, {
  Props as SliderController0Props
} from "./controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseSliderProps = {
  trackProps?: ElementProps;
  grabberProps?: ElementProps;
} & ElementProps;

export type _956880c910105Props = SliderController0Props;
export const Slider: (
  props: SliderController0Props
) => React.ReactElement<SliderController0Props>;
