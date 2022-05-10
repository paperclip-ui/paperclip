import * as React from "react";
import FrameController0, {
  Props as FrameController0Props,
} from "./frame-controller";
import FramesController0, {
  Props as FramesController0Props,
} from "./frames-controller";
import { _5b2acf9d22Props } from "../../../../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseFrameProps = {
  variant?: string;
  backgroundProps?: ElementProps;
  topBarProps?: ElementProps;
  elementProps?: ElementProps;
  titleProps?: TextProps;
  controlsProps?: ElementProps;
  previewButtonProps?: _5b2acf9d22Props;
  hasControllerProps?: ElementProps;
} & ElementProps;

export type _11188f863945Props = FrameController0Props;
export const Frame: (
  props: FrameController0Props
) => React.ReactElement<FrameController0Props>;

export type BaseFramesProps = {
  backgroundProps?: ElementProps;
  contentProps?: ElementProps;
} & ElementProps;

export type _bae08a2e609807Props = FramesController0Props;
export const Frames: (
  props: FramesController0Props
) => React.ReactElement<FramesController0Props>;
