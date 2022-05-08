import * as React from "react";
export default (Base) => class PromptController extends React.PureComponent {
    constructor(props) {
        super(props);
        this.onOk = () => {
            this.props.onOk(this.state.value);
        };
        this.onInputChange = value => {
            this.setState(Object.assign(Object.assign({}, this.state), { value }));
        };
        this.state = {
            value: props.defaultValue
        };
    }
    render() {
        const { label, onCancel, defaultValue } = this.props;
        const { onInputChange, onOk } = this;
        return (React.createElement(Base, { textProps: { text: label }, okButtonProps: { onClick: onOk }, cancelButtonProps: { onClick: onCancel }, inputProps: {
                onChange: onInputChange,
                onChangeComplete: onOk,
                focus: true,
                value: defaultValue
            } }));
    }
};
//# sourceMappingURL=controller.js.map