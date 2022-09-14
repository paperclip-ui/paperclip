import "./index.scss";
import * as React from "react";
const {
  QuickSearch: BaseQuickSearch,
  SearchResult: BaseSearchResult,
  QuickSearchInput,
} = require("./view.pc");
import { RootState } from "../../state";
import { Dispatch } from "redux";
import {
  quickSearchItemClicked,
  quickSearchBackgroundClick,
} from "../../actions";
import { File } from "tandem-common";
import { FocusComponent } from "../focus";

type QuickSearchOuterProps = {
  root: RootState;
  dispatch: Dispatch<any>;
};

type State = {
  filter: string[];
};

export class QuickSearchComponent extends React.PureComponent<
  QuickSearchOuterProps,
  State
> {
  state = {
    filter: null,
  };
  setFilter = (value: string[]) => {
    this.setState({ ...this.state, filter: value });
  };
  onInputKeyDown = (event) => {
    this.setFilter(
      String(event.target.value || "")
        .toLowerCase()
        .trim()
        .split(" ")
    );
  };

  onBackgroundClick = () => {
    this.props.dispatch(quickSearchBackgroundClick());
  };
  render() {
    const { root } = this.props;
    const { onBackgroundClick, onInputKeyDown } = this;
    if (!root.showQuickSearch) {
      return null;
    }
    return (
      <div className="m-quick-search">
        <div className="background" onClick={onBackgroundClick} />
        <BaseQuickSearch
          className="modal"
          searchResultsProps={
            {
              // children: results
            }
          }
          inputWrapperProps={{
            children: (
              <FocusComponent>
                <QuickSearchInput onKeyUp={onInputKeyDown} />
              </FocusComponent>
            ),
          }}
        />
      </div>
    );
  }
}
