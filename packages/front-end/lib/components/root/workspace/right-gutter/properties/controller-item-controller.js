import * as React from "react";
import cx from "classnames";
import { openControllerButtonClicked } from "../../../../../actions";
export default (Base) => {
    return class ControllerItemController extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.onClick = () => {
                this.props.onClick(this.props.relativePath);
            };
            this.onOpenClick = (event) => {
                event.stopPropagation();
                const { dispatch, relativePath } = this.props;
                dispatch(openControllerButtonClicked(relativePath));
            };
        }
        render() {
            const { onOpenClick, onClick } = this;
            const { relativePath, selected } = this.props;
            return (React.createElement(Base, { onClick: onClick, openButtonProps: { onClick: onOpenClick }, labelProps: { text: relativePath }, variant: cx({ selected }) }));
        }
    };
};
//# sourceMappingURL=controller-item-controller.js.map