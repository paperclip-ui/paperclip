import * as React from "react";
import SearchResultController0, {
  Props as SearchResultController0Props,
} from "./search-result-controller";
import { _711f2f581678Props } from "../../icons/view.pc";

type TextProps = {
  text?: string;
} & React.HTMLAttributes<any>;

type ElementProps = {
  ref?: any;
} & React.HTMLAttributes<any>;

export type BaseSearchResultProps = {
  variant?: string;
  label?: any;
  description?: any;
  labelContainerProps?: ElementProps;
  labelProps?: TextProps;
  descriptionContainerProps?: ElementProps;
  descriptionProps?: TextProps;
  splitTabButtonProps?: _711f2f581678Props;
  hoveringProps?: ElementProps;
  preselectedProps?: ElementProps;
} & ElementProps;

export type _808486bb13Props = SearchResultController0Props;
export const SearchResult: (
  props: SearchResultController0Props
) => React.ReactElement<SearchResultController0Props>;
