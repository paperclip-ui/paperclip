import * as React from "react";
import PromptController0, {
  Props as PromptController0Props
} from "./controller";
import { _7149f8199122Props } from "../inputs/text/view.pc";
import { _9f364d2139415Props } from "../inputs/button/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BasePromptProps = {
  elementProps?: ElementProps;
  textProps?: TextProps;
  inputProps: _7149f8199122Props;
  elementProps1?: ElementProps;
  cancelButtonProps?: _9f364d2139415Props;
  okButtonProps?: _9f364d2139415Props;
} & ElementProps;

export type _9f364d214148Props = PromptController0Props;
export const Prompt: (
  props: PromptController0Props
) => React.ReactElement<PromptController0Props>;
