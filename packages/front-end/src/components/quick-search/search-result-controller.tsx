import * as React from "react";
import * as ReactDOM from "react-dom";
import cx from "classnames";
import { Dispatch } from "redux";
import {
  quickSearchItemClicked,
  quickSearchResultItemSplitButtonClick
} from "../../actions";
import { File, memoize } from "tandem-common";
import { BaseSearchResultProps } from "./row.pc";
import { BaseQuickSearchResult, QuickSearchResult } from "../../state";
import scrollIntoView from "scroll-into-view-if-needed";

export type Props = {
  item: QuickSearchResult;
  dispatch: Dispatch<any>;
  preselected: boolean;
};

export default (Base: React.ComponentClass<BaseSearchResultProps>) =>
  class SearchResultController extends React.PureComponent<Props> {
    onClick = () => {
      this.props.dispatch(quickSearchItemClicked(this.props.item));
    };
    onSplitButtonClick = () => {
      this.props.dispatch(
        quickSearchResultItemSplitButtonClick(this.props.item)
      );
    };
    componentDidUpdate(prevProps: Props) {
      if (this.props.preselected && !prevProps.preselected) {
        scrollIntoView(ReactDOM.findDOMNode(this) as HTMLDivElement, {
          scrollMode: "if-needed"
        });
      }
    }
    render() {
      const { item, preselected, ...rest } = this.props;
      const { onClick, onSplitButtonClick } = this;

      return (
        <Base
          {...rest}
          splitTabButtonProps={{
            onClick: onSplitButtonClick
          }}
          variant={cx({
            preselected
          })}
          onClick={onClick}
          labelProps={{ text: item.label }}
          descriptionProps={{ text: item.description }}
        />
      );
    }
  };
