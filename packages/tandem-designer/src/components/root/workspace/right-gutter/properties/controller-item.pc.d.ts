import * as React from "react";
import ControllerItemController0, {
  Props as ControllerItemController0Props,
} from "./controller-item-controller";
import { _f89d0ee72498Props } from "../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseControllerItemProps = {
  variant?: string;
  labelProps?: TextProps;
  openButtonProps?: _f89d0ee72498Props;
  selectedProps?: ElementProps;
  altProps?: ElementProps;
  hoveringProps?: ElementProps;
} & ElementProps;

export type _60ea77f73Props = ControllerItemController0Props;
export const ControllerItem: (
  props: ControllerItemController0Props
) => React.ReactElement<ControllerItemController0Props>;
