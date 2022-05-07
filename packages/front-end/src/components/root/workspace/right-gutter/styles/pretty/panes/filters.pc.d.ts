import * as React from "react";
import { _b6c162d113Props } from "../../../../../../pane/view.pc";
import { _f27782548182Props } from "../../../../../../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseFiltersProps = {
  elementProps?: ElementProps;
  textProps?: TextProps;
  elementProps1?: ElementProps;
  addIconProps?: _f27782548182Props;
  filterItemProps?: _43fa80867000Props;
} & _b6c162d113Props;

export type _bcda9fb597947Props = BaseFiltersProps;

export const Filters: (
  props: BaseFiltersProps
) => React.ReactElement<BaseFiltersProps>;

export type BaseFilterItemProps = {} & ElementProps;

export type _43fa80867000Props = BaseFilterItemProps;

export const FilterItem: (
  props: BaseFilterItemProps
) => React.ReactElement<BaseFilterItemProps>;
