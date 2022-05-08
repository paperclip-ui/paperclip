import * as React from "react";
export default (Base) => {
    return class CheckboxController extends React.PureComponent {
        constructor() {
            super(...arguments);
            this.onClick = event => {
                const { value, onChange, onChangeComplete } = this.props;
                event.stopPropagation();
                if (onChange) {
                    onChange(value);
                }
                if (onChangeComplete) {
                    onChangeComplete(!value);
                }
            };
        }
        render() {
            return React.createElement(Base, Object.assign({ onClick: this.onClick }, this.props));
        }
    };
};
//# sourceMappingURL=controller.js.map