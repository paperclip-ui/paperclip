import * as React from "react";
import QueriesPaneController0, {
  Props as QueriesPaneController0Props
} from "./controller";
import QueryItemController0, {
  Props as QueryItemController0Props
} from "./query-item-controller";
import MediaQueryOptionsController0, {
  Props as MediaQueryOptionsController0Props
} from "./media-query-options-controller";
import VariableQueryOptionsController0, {
  Props as VariableQueryOptionsController0Props
} from "./variable-query-options-controller";
import QueryOptionsController0, {
  Props as QueryOptionsController0Props
} from "./query-options-controller";
import { _b6c162d113Props } from "../../../../pane/view.pc";
import { _50e32bec2591Props } from "../../../../inputs/dropdown/view.pc";
import {
  _f27782548182Props,
  _9f7a77048356Props
} from "../../../../../icons/view.pc";
import { _5673c5c21327Props } from "../../../../side-panel/view.pc";
import { _7149f8199122Props } from "../../../../inputs/text/view.pc";
import { _7149f8192509Props } from "../../../../inputs/molecules.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseQueriesPaneProps = {
  items?: any;
  paneProps?: _b6c162d113Props;
  elementProps?: ElementProps;
  labelProps?: TextProps;
  controlsProps?: ElementProps;
  addQueryDropdownProps: _50e32bec2591Props;
  addButtonProps?: _f27782548182Props;
  itemsProps?: ElementProps;
  elementProps1: _f97289c6592Props;
  elementProps2: _f97289c6592Props;
  elementProps3: _f97289c6592Props;
  elementProps4: _f97289c6592Props;
  elementProps5: _f97289c6592Props;
} & ElementProps;

export type _66811b5c421Props = QueriesPaneController0Props;
export const QueriesPane: (
  props: QueriesPaneController0Props
) => React.ReactElement<QueriesPaneController0Props>;

export type BaseQueryItemProps = {
  editButtonProps: _5673c5c21327Props;
  pencilIcon2Props?: _9f7a77048356Props;
  queryOptionsProps: _9bda7c6d850Props;
  labelInputProps: _7149f8199122Props;
} & ElementProps;

export type _f97289c6592Props = QueryItemController0Props;
export const QueryItem: (
  props: QueryItemController0Props
) => React.ReactElement<QueryItemController0Props>;

export type BaseMediaQueryOptionsProps = {
  labeledInputProps?: _7149f8192509Props;
  minWidthInputProps: _7149f8199122Props;
  labeledInputProps1?: _7149f8192509Props;
  maxWidthInputProps: _7149f8199122Props;
} & ElementProps;

export type _f97289c61969Props = MediaQueryOptionsController0Props;
export const MediaQueryOptions: (
  props: MediaQueryOptionsController0Props
) => React.ReactElement<MediaQueryOptionsController0Props>;

export type BaseVariableQueryOptionsProps = {
  labeledInputProps?: _7149f8192509Props;
  variableInputProps: _50e32bec2591Props;
  labeledInputProps1?: _7149f8192509Props;
  equalsInputProps: _7149f8199122Props;
  labeledInputProps2?: _7149f8192509Props;
  notEqualsInputProps: _7149f8199122Props;
} & ElementProps;

export type _f97289c62059Props = VariableQueryOptionsController0Props;
export const VariableQueryOptions: (
  props: VariableQueryOptionsController0Props
) => React.ReactElement<VariableQueryOptionsController0Props>;

export type BaseQueryOptionsProps = {
  variant?: string;
  labeledInputProps?: _7149f8192509Props;
  typeInputProps: _50e32bec2591Props;
  mediaQueryOptionsProps: _f97289c61969Props;
  variableQueryOptionsProps: _f97289c62059Props;
  mediaProps?: ElementProps;
  variableProps?: ElementProps;
} & ElementProps;

export type _9bda7c6d850Props = QueryOptionsController0Props;
export const QueryOptions: (
  props: QueryOptionsController0Props
) => React.ReactElement<QueryOptionsController0Props>;
