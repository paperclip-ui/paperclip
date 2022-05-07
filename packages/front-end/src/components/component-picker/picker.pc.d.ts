import * as React from "react";
import PickerController0, {
  Props as PickerController0Props
} from "./picker-controller";
import FilterController0, {
  Props as FilterController0Props
} from "../focus/controller";
import ComponentPopdownPickerController0, {
  Props as ComponentPopdownPickerController0Props
} from "./picker2-controller";
import { _7149f8199122Props } from "../inputs/text/view.pc";
import { _936f2927707Props } from "../inputs/molecules.pc";
import { _724c3c9e7Props } from "../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BasePickerProps = {
  filterInputProps: _33949bb81531102Props;
  optionsProps?: ElementProps;
} & ElementProps;

export type _dcd2c13f21458Props = PickerController0Props;
export const Picker: (
  props: PickerController0Props
) => React.ReactElement<PickerController0Props>;

export type BaseFilterProps = {} & _7149f8199122Props;

export type _33949bb81531102Props = FilterController0Props;
export const Filter: (
  props: FilterController0Props
) => React.ReactElement<FilterController0Props>;

export type BaseComponentPopdownPickerProps = {
  variant?: string;
  items?: any;
  tooltipProps?: _936f2927707Props;
  contentProps?: ElementProps;
  headerProps?: ElementProps;
  filterProps: _7149f8199122Props;
  itemsProps?: ElementProps;
  itemProps?: _936f29271179Props;
  itemProps1?: _936f29271179Props;
  itemProps2?: _936f29271179Props;
  itemProps3?: _936f29271179Props;
  itemProps4?: _936f29271179Props;
  itemProps5?: _936f29271179Props;
  itemProps6?: _936f29271179Props;
  itemProps7?: _936f29271179Props;
  itemProps8?: _936f29271179Props;
  itemProps9?: _936f29271179Props;
  itemProps10?: _936f29271179Props;
  itemProps11?: _936f29271179Props;
  itemProps12?: _936f29271179Props;
  noComponentsProps?: ElementProps;
  noneFoundProps?: TextProps;
  descProps?: TextProps;
  ctraProps?: TextProps;
  periodProps?: TextProps;
  noComponentsProps1?: ElementProps;
} & ElementProps;

export type _936f29271359Props = ComponentPopdownPickerController0Props;
export const ComponentPopdownPicker: (
  props: ComponentPopdownPickerController0Props
) => React.ReactElement<ComponentPopdownPickerController0Props>;

export type BaseComponentPickerPopdownItemProps = {
  variant?: string;
  componentIconProps?: _724c3c9e7Props;
  componentNameProps?: TextProps;
  altProps?: ElementProps;
  hoverProps?: ElementProps;
  preselectedProps?: ElementProps;
} & ElementProps;

export type _936f29271179Props = BaseComponentPickerPopdownItemProps;

export const ComponentPickerPopdownItem: (
  props: BaseComponentPickerPopdownItemProps
) => React.ReactElement<BaseComponentPickerPopdownItemProps>;
