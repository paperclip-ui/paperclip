import * as React from "react";
import DropdownController0, {
  Props as DropdownController0Props
} from "./controller";
import { _9b7b527f175442Props } from "../../popover/view.pc";
import { _7149f8199122Props } from "../text/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseDropdownProps = {
  variant?: string;
  button?: any;
  options?: any;
  popoverProps: _9b7b527f175442Props;
  buttonProps?: ElementProps;
  filterInputProps: _7149f8199122Props;
  labelProps?: TextProps;
  menuProps?: ElementProps;
  filterableProps?: ElementProps;
  specialProps?: ElementProps;
} & ElementProps;

export type _50e32bec2591Props = DropdownController0Props;
export const Dropdown: (
  props: DropdownController0Props
) => React.ReactElement<DropdownController0Props>;
