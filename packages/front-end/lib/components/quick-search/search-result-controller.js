var __rest = (this && this.__rest) || function (s, e) {
    var t = {};
    for (var p in s) if (Object.prototype.hasOwnProperty.call(s, p) && e.indexOf(p) < 0)
        t[p] = s[p];
    if (s != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i = 0, p = Object.getOwnPropertySymbols(s); i < p.length; i++) {
            if (e.indexOf(p[i]) < 0 && Object.prototype.propertyIsEnumerable.call(s, p[i]))
                t[p[i]] = s[p[i]];
        }
    return t;
};
import * as React from "react";
import * as ReactDOM from "react-dom";
import cx from "classnames";
import { quickSearchItemClicked, quickSearchResultItemSplitButtonClick } from "../../actions";
import scrollIntoView from "scroll-into-view-if-needed";
export default (Base) => class SearchResultController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onClick = () => {
            this.props.dispatch(quickSearchItemClicked(this.props.item));
        };
        this.onSplitButtonClick = () => {
            this.props.dispatch(quickSearchResultItemSplitButtonClick(this.props.item));
        };
    }
    componentDidUpdate(prevProps) {
        if (this.props.preselected && !prevProps.preselected) {
            scrollIntoView(ReactDOM.findDOMNode(this), {
                scrollMode: "if-needed"
            });
        }
    }
    render() {
        const _a = this.props, { item, preselected } = _a, rest = __rest(_a, ["item", "preselected"]);
        const { onClick, onSplitButtonClick } = this;
        return (React.createElement(Base, Object.assign({}, rest, { splitTabButtonProps: {
                onClick: onSplitButtonClick
            }, variant: cx({
                preselected
            }), onClick: onClick, labelProps: { text: item.label }, descriptionProps: { text: item.description } })));
    }
};
//# sourceMappingURL=search-result-controller.js.map