import "./index.scss";
import * as React from "react";
const { QuickSearch: BaseQuickSearch, SearchResult: BaseSearchResult, QuickSearchInput } = require("./view.pc");
import { quickSearchBackgroundClick } from "../../actions";
import { FocusComponent } from "../focus";
export class QuickSearchComponent extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.state = {
            filter: null
        };
        this.setFilter = (value) => {
            this.setState(Object.assign(Object.assign({}, this.state), { filter: value }));
        };
        this.onInputKeyDown = event => {
            this.setFilter(String(event.target.value || "")
                .toLowerCase()
                .trim()
                .split(" "));
        };
        this.onBackgroundClick = () => {
            this.props.dispatch(quickSearchBackgroundClick());
        };
    }
    render() {
        const { root } = this.props;
        const { onBackgroundClick, onInputKeyDown } = this;
        if (!root.showQuickSearch) {
            return null;
        }
        return (React.createElement("div", { className: "m-quick-search" },
            React.createElement("div", { className: "background", onClick: onBackgroundClick }),
            React.createElement(BaseQuickSearch, { className: "modal", searchResultsProps: {
                // children: results
                }, inputWrapperProps: {
                    children: (React.createElement(FocusComponent, null,
                        React.createElement(QuickSearchInput, { onKeyUp: onInputKeyDown })))
                } })));
    }
}
//# sourceMappingURL=index.js.map