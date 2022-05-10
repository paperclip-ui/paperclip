import * as React from "react";
import StarterKitFormOptionsController0, {
  Props as StarterKitFormOptionsController0Props,
} from "./form-controller";
import { _ac29cd45169Props } from "./react/form.pc";
import { _7149f8192509Props } from "../components/inputs/molecules.pc";
import { _7149f8199122Props } from "../components/inputs/text/view.pc";
import { _9f364d2139415Props } from "../components/inputs/button/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseStarterKitFormOptionsProps = {
  variant?: string;
  elementProps?: ElementProps;
  titleProps?: TextProps;
  reactStartKitOptionsFormProps?: _ac29cd45169Props;
  labeledInputProps?: _7149f8192509Props;
  elementProps1?: ElementProps;
  directoryInputProps: _7149f8199122Props;
  browseButtonProps?: _9f364d2139415Props;
  elementProps2?: ElementProps;
  createProjectButtonProps?: _9f364d2139415Props;
  reactProps?: ElementProps;
} & ElementProps;

export type _c6acc7ee930Props = StarterKitFormOptionsController0Props;
export const StarterKitFormOptions: (
  props: StarterKitFormOptionsController0Props
) => React.ReactElement<StarterKitFormOptionsController0Props>;
