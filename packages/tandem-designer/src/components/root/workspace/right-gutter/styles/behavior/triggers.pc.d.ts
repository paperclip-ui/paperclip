import * as React from "react";
import TriggersPaneController0, {
  Props as TriggersPaneController0Props,
} from "./triggers-controller";
import TriggerItemController0, {
  Props as TriggerItemController0Props,
} from "./trigger-item-controller";
import { _b6c162d113Props } from "../../../../../pane/view.pc";
import {
  _d30286e83385Props,
  _f27782548182Props,
} from "../../../../../../icons/view.pc";
import { _50e32bec2591Props } from "../../../../../inputs/dropdown/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseTriggersPaneProps = {
  variant?: string;
  items?: any;
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  removeTriggerButtonProps?: _d30286e83385Props;
  addTriggerButtonProps?: _f27782548182Props;
  itemsProps?: ElementProps;
  itemProps: _26f623457441Props;
  itemProps1: _26f623457441Props;
  itemProps2: _26f623457441Props;
  footerProps?: ElementProps;
  textProps1?: TextProps;
  elementProps2?: ElementProps;
  textProps2?: TextProps;
  hasTriggersProps?: ElementProps;
  hasItemSelectedProps?: ElementProps;
} & _b6c162d113Props;

export type _8f20d2148434Props = TriggersPaneController0Props;
export const TriggersPane: (
  props: TriggersPaneController0Props
) => React.ReactElement<TriggersPaneController0Props>;

export type BaseTriggerItemProps = {
  variant?: string;
  backgroundProps?: ElementProps;
  sourceInputProps: _50e32bec2591Props;
  textProps?: TextProps;
  targetInputProps: _50e32bec2591Props;
  selectedProps?: ElementProps;
} & ElementProps;

export type _26f623457441Props = TriggerItemController0Props;
export const TriggerItem: (
  props: TriggerItemController0Props
) => React.ReactElement<TriggerItemController0Props>;
