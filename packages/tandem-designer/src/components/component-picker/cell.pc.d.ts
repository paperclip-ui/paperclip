import * as React from "react";
import ComponentOptionController0, {
  Props as ComponentOptionController0Props,
} from "./cell-controller";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseComponentOptionProps = {
  innerProps?: ElementProps;
  centerProps?: ElementProps;
  textProps?: TextProps;
} & ElementProps;

export type _dcd2c13f1453155Props = ComponentOptionController0Props;
export const ComponentOption: (
  props: ComponentOptionController0Props
) => React.ReactElement<ComponentOptionController0Props>;
