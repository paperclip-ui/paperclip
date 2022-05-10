import * as React from "react";
import MainController0, { Props as MainController0Props } from "./controller";
import { _9f364d2139415Props } from "../../../components/inputs/button/view.pc";
import { _33b1b6b133319Props } from "../../../components/root/workspace/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseMainProps = {
  containerProps?: ElementProps;
  centerProps?: ElementProps;
  titleProps?: TextProps;
  textProps?: TextProps;
  linkButtonProps?: ElementProps;
  textProps1?: TextProps;
  elementProps?: ElementProps;
  restartButtonProps?: _9f364d2139415Props;
} & ElementProps;

export type _900e27cd182Props = MainController0Props;
export const Main: (
  props: MainController0Props
) => React.ReactElement<MainController0Props>;
