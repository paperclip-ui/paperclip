import * as React from "react";
import ColorInputController0, {
  Props as ColorInputController0Props,
} from "./color-input-controller";
import { _9b7b527f175442Props } from "../../popover/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseColorInputProps = {
  content?: any;
  popoverProps: _9b7b527f175442Props;
  buttonProps?: ElementProps;
  popdownProps?: ElementProps;
} & ElementProps;

export type _d227ff68826768Props = ColorInputController0Props;
export const ColorInput: (
  props: ColorInputController0Props
) => React.ReactElement<ColorInputController0Props>;
