import * as React from "react";
import * as cx from "classnames";
import { EMPTY_ARRAY } from "tandem-common";
import { QuickSearch } from "../../state";
import { Dispatch } from "redux";
import { BaseQuickSearchProps } from "./view.pc";
import { SearchResult } from "./row.pc";
import {
  quickSearchFilterChanged,
  quickSearchItemClicked,
  quickSearchInputEntered
} from "../../actions";

export type Props = {
  quickSearch: QuickSearch;
  dispatch: Dispatch<any>;
};

type State = {
  preselectIndex: number;
};

export default (Base: React.ComponentClass<BaseQuickSearchProps>) =>
  class QuickSearchController extends React.PureComponent<Props, State> {
    state = {
      preselectIndex: 0
    };
    onInputChange = value => {
      this.setState({ preselectIndex: 0 });
      this.props.dispatch(
        quickSearchFilterChanged(
          String(value || "")
            .toLowerCase()
            .trim()
        )
      );
    };
    onQuickSearchKeyDown = (event: React.KeyboardEvent<any>) => {
      const matches =
        (this.props.quickSearch && this.props.quickSearch.matches) ||
        EMPTY_ARRAY;
      let preselectedIndex = this.state.preselectIndex;
      if (!matches.length) {
        return;
      }
      if (event.key === "Enter") {
        this.props.dispatch(quickSearchInputEntered(matches[preselectedIndex]));
      } else if (event.key === "ArrowDown") {
        preselectedIndex++;
      } else if (event.key === "ArrowUp") {
        preselectedIndex--;
      }
      this.setState({
        ...this.state,
        preselectIndex: Math.max(
          0,
          Math.min(preselectedIndex, matches.length - 1)
        )
      });
    };
    render() {
      const { quickSearch, dispatch } = this.props;
      const { preselectIndex } = this.state;
      const { onInputChange, onQuickSearchKeyDown } = this;

      const matches = (quickSearch && quickSearch.matches) || EMPTY_ARRAY;
      const filter = quickSearch && quickSearch.filter;
      const results = matches.map((quickSearchResult, i) => {
        return (
          <SearchResult
            item={quickSearchResult}
            key={i}
            dispatch={dispatch}
            preselected={i === preselectIndex}
          />
        );
      });

      return (
        <Base
          searchResultsProps={{
            children: results
          }}
          variant={cx({
            noItems: results.length === 0
          })}
          quickSearchInputProps={{
            onKeyDown: onQuickSearchKeyDown,
            defaultValue: filter,
            onChange: onInputChange,
            focus: true
          }}
        />
      );
    }
  };
