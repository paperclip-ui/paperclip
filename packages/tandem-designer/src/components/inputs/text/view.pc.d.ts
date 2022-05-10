import * as React from "react";
import TextInputController0, {
  Props as TextInputController0Props,
} from "./controller";
import AutoComleteTextInputController0, {
  Props as AutoComleteTextInputController0Props,
} from "./auto-complete-controller";
import { _9b7b527f175442Props } from "../../popover/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTextInputProps = {
  variant?: string;
  focusProps?: ElementProps;
  disabledProps?: ElementProps;
} & ElementProps;

export type _7149f8199122Props = TextInputController0Props;
export const TextInput: (
  props: TextInputController0Props
) => React.ReactElement<TextInputController0Props>;

export type BaseAutoComleteTextInputProps = {
  menu?: any;
  popoverProps: _9b7b527f175442Props;
  textInputProps: _7149f8199122Props;
  menuOuterProps?: ElementProps;
} & ElementProps;

export type _2c83e997743Props = AutoComleteTextInputController0Props;
export const AutoComleteTextInput: (
  props: AutoComleteTextInputController0Props
) => React.ReactElement<AutoComleteTextInputController0Props>;
