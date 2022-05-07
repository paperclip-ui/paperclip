import * as React from "react";
import InheritItemController0, {
  Props as InheritItemController0Props
} from "./inherit-item-controller";
import { _ec3f9b216704Props } from "../../../../../../../icons/view.pc";
import { _50e32bec2591Props } from "../../../../../../inputs/dropdown/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseInheritItemProps = {
  variant?: string;
  elementProps?: ElementProps;
  colorPaletteIconProps?: _ec3f9b216704Props;
  dropdownProps: _50e32bec2591Props;
  selectedProps?: ElementProps;
  altProps?: ElementProps;
} & ElementProps;

export type _9e4a454812260Props = InheritItemController0Props;
export const InheritItem: (
  props: InheritItemController0Props
) => React.ReactElement<InheritItemController0Props>;
