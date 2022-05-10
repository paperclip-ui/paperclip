import * as React from "react";
import ModalController0, {
  Props as ModalController0Props,
} from "./modal-controller";
import { _dcd2c13f21458Props } from "./picker.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseModalProps = {
  backgroundProps?: ElementProps;
  pickerProps: _dcd2c13f21458Props;
} & ElementProps;

export type _dcd2c13f1117488Props = ModalController0Props;
export const Modal: (
  props: ModalController0Props
) => React.ReactElement<ModalController0Props>;
