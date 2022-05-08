import * as React from "react";
import { getPrettyPaneColorSwatchOptionGroups } from "./utils";
import { stringifyCSSBackground } from "./inputs/background/state";
export default (Base) => class BackgroundItemController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onRemoveButtonClick = () => {
            this.props.onRemove();
        };
    }
    render() {
        const { onRemoveButtonClick } = this;
        const { cwd, documentColors, value, onChange, onChangeComplete, globalVariables } = this.props;
        return (React.createElement(Base, { backgroundInputProps: {
                cwd,
                swatchOptionGroups: getPrettyPaneColorSwatchOptionGroups(documentColors, globalVariables),
                value,
                onChange,
                onChangeComplete
            }, labelProps: {
                text: stringifyCSSBackground(value)
            }, removeButtonProps: {
                onClick: onRemoveButtonClick
            } }));
    }
};
//# sourceMappingURL=background-item-controller.js.map