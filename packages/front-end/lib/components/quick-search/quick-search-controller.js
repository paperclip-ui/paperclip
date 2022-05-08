import * as React from "react";
import cx from "classnames";
import { EMPTY_ARRAY } from "tandem-common";
import { SearchResult } from "./row.pc";
import { quickSearchFilterChanged, quickSearchInputEntered } from "../../actions";
export default (Base) => class QuickSearchController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            preselectIndex: 0
        };
        this.onInputChange = value => {
            this.setState({ preselectIndex: 0 });
            this.props.dispatch(quickSearchFilterChanged(String(value || "")
                .toLowerCase()
                .trim()));
        };
        this.onQuickSearchKeyDown = (event) => {
            const matches = (this.props.quickSearch && this.props.quickSearch.matches) ||
                EMPTY_ARRAY;
            let preselectedIndex = this.state.preselectIndex;
            if (!matches.length) {
                return;
            }
            if (event.key === "Enter") {
                this.props.dispatch(quickSearchInputEntered(matches[preselectedIndex]));
            }
            else if (event.key === "ArrowDown") {
                preselectedIndex++;
            }
            else if (event.key === "ArrowUp") {
                preselectedIndex--;
            }
            this.setState(Object.assign(Object.assign({}, this.state), { preselectIndex: Math.max(0, Math.min(preselectedIndex, matches.length - 1)) }));
        };
    }
    render() {
        const { quickSearch, dispatch } = this.props;
        const { preselectIndex } = this.state;
        const { onInputChange, onQuickSearchKeyDown } = this;
        const matches = (quickSearch && quickSearch.matches) || EMPTY_ARRAY;
        const filter = quickSearch && quickSearch.filter;
        const results = matches.map((quickSearchResult, i) => {
            return (React.createElement(SearchResult, { item: quickSearchResult, key: i, dispatch: dispatch, preselected: i === preselectIndex }));
        });
        return (React.createElement(Base, { searchResultsProps: {
                children: results
            }, variant: cx({
                noItems: results.length === 0
            }), quickSearchInputProps: {
                onKeyDown: onQuickSearchKeyDown,
                defaultValue: filter,
                onChange: onInputChange,
                focus: true
            } }));
    }
};
//# sourceMappingURL=quick-search-controller.js.map