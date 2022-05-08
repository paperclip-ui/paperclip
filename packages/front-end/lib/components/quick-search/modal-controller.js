import * as React from "react";
import { quickSearchBackgroundClick } from "../../actions";
export default (Base) => class ModalController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onBackgroundClick = () => {
            this.props.dispatch(quickSearchBackgroundClick());
        };
    }
    render() {
        const { root, dispatch } = this.props;
        const { onBackgroundClick } = this;
        if (!root.showQuickSearch) {
            return null;
        }
        return (React.createElement(Base, { backgroundProps: {
                onClick: onBackgroundClick
            }, quickSearchProps: {
                quickSearch: root.quickSearch,
                dispatch
            } }));
    }
};
//# sourceMappingURL=modal-controller.js.map