import * as React from "react";
import QuickSearchController0, {
  Props as QuickSearchController0Props,
} from "./quick-search-controller";
import ModalController0, {
  Props as ModalController0Props,
} from "./modal-controller";
import { _7149f8199122Props } from "../inputs/text/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseQuickSearchProps = {
  variant?: string;
  wrapperProps?: ElementProps;
  inputWrapperProps?: ElementProps;
  quickSearchInputProps: _7149f8199122Props;
  searchResultsOuterProps?: ElementProps;
  searchResultsProps?: ElementProps;
  noItemsProps?: ElementProps;
} & ElementProps;

export type _808486bb3Props = QuickSearchController0Props;
export const QuickSearch: (
  props: QuickSearchController0Props
) => React.ReactElement<QuickSearchController0Props>;

export type BaseQuickSearchInputProps = {} & ElementProps;

export type _808486bb17Props = BaseQuickSearchInputProps;

export const QuickSearchInput: (
  props: BaseQuickSearchInputProps
) => React.ReactElement<BaseQuickSearchInputProps>;

export type BaseModalProps = {
  backgroundProps?: ElementProps;
  elementProps?: ElementProps;
  quickSearchProps: _808486bb3Props;
} & ElementProps;

export type _63257bfd1978831Props = ModalController0Props;
export const Modal: (
  props: ModalController0Props
) => React.ReactElement<ModalController0Props>;
