import * as React from "react";
import ButtonBarController0, {
  Props as ButtonBarController0Props
} from "./controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseButtonBarProps = {
  items?: any;
  borderProps?: ElementProps;
} & ElementProps;

export type _6489655782833Props = ButtonBarController0Props;
export const ButtonBar: (
  props: ButtonBarController0Props
) => React.ReactElement<ButtonBarController0Props>;
