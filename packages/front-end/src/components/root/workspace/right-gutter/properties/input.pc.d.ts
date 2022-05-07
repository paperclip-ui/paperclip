import * as React from "react";
import InputPropertiesController0, {
  Props as InputPropertiesController0Props
} from "./input-controller";
import { _7149f8199122Props } from "../../../../inputs/text/view.pc";
import { _7149f8192509Props } from "../../../../inputs/molecules.pc";
import { _50e32bec2591Props } from "../../../../inputs/dropdown/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseInputPropertiesProps = {
  placeholderInputProps: _7149f8199122Props;
  labeledInputProps?: _7149f8192509Props;
  inputTypeInputProps: _50e32bec2591Props;
} & ElementProps;

export type _6e2729d443544Props = InputPropertiesController0Props;
export const InputProperties: (
  props: InputPropertiesController0Props
) => React.ReactElement<InputPropertiesController0Props>;
