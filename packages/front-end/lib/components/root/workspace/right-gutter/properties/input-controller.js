import * as React from "react";
import { attributeChanged } from "../../../../../actions";
import { dropdownMenuOptionFromValue } from "../../../../inputs/dropdown/controller";
const INPUT_TYPE_OPTIONS = [
    "color",
    "date",
    "file",
    "datetime-local",
    "email",
    "month",
    "number",
    "range",
    "search",
    "tel",
    "time",
    "url",
    "week",
    "checkbox"
]
    .map(dropdownMenuOptionFromValue)
    .sort((a, b) => {
    return a < b ? -1 : 1;
});
export default (Base) => class InputController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onPlaceholderChange = value => {
            this.props.dispatch(attributeChanged("placeholder", value));
        };
        this.onInputTypeChange = value => {
            this.props.dispatch(attributeChanged("type", value));
        };
    }
    render() {
        const { baseName, sourceNode, graph } = this.props;
        if (baseName !== "input") {
            return null;
        }
        const { onPlaceholderChange, onInputTypeChange } = this;
        return (React.createElement(Base, { placeholderInputProps: {
                value: sourceNode.attributes.placeholder,
                onChange: onPlaceholderChange
            }, inputTypeInputProps: {
                options: INPUT_TYPE_OPTIONS,
                onChangeComplete: onInputTypeChange,
                value: sourceNode.attributes.type
            } }));
    }
};
//# sourceMappingURL=input-controller.js.map