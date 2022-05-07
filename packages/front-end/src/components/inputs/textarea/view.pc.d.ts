import * as React from "react";
import TextareaController0, {
  Props as TextareaController0Props
} from "./controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTextareaProps = {
  variant?: string;
  focusProps?: ElementProps;
} & ElementProps;

export type _d65d17fd4015Props = TextareaController0Props;
export const Textarea: (
  props: TextareaController0Props
) => React.ReactElement<TextareaController0Props>;
