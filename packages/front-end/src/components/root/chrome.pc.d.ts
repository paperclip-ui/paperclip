import * as React from "react";
import ChromeController0, {
  Props as ChromeController0Props
} from "./chrome-controller";
import { _22a403a63977Props } from "../menubar/view.pc";
import { _fe72344f18313Props } from "./tools/view.pc";
import { _936f29271179Props } from "../component-picker/picker.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseChromeProps = {
  variant?: string;
  label?: any;
  content?: any;
  headerProps?: ElementProps;
  macOsButtonsProps?: ElementProps;
  closeButtonProps?: _32ef79b71331754Props;
  minimizeButtonProps?: _32ef79b71331754Props;
  maximizeButtonProps?: _32ef79b71331754Props;
  menuProps?: _22a403a63977Props;
  centerProps?: ElementProps;
  textProps?: TextProps;
  unsavedCircleProps?: ElementProps;
  controlsProps?: ElementProps;
  buildButtonProps: _fe72344f18313Props;
  contentProps?: ElementProps;
  textProps1?: TextProps;
  unsavedProps?: ElementProps;
  minimalProps?: ElementProps;
  hasSelectedProjectProps?: ElementProps;
  macosProps?: ElementProps;
  windowsProps?: ElementProps;
} & ElementProps;

export type _8d443eb52140093Props = ChromeController0Props;
export const Chrome: (
  props: ChromeController0Props
) => React.ReactElement<ChromeController0Props>;

export type BaseChromeHeaderButtonProps = {} & ElementProps;

export type _32ef79b71331754Props = BaseChromeHeaderButtonProps;

export const ChromeHeaderButton: (
  props: BaseChromeHeaderButtonProps
) => React.ReactElement<BaseChromeHeaderButtonProps>;
