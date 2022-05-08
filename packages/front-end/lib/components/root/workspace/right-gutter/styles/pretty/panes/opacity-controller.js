import * as React from "react";
import { cssPropertyChanged, cssPropertyChangeCompleted } from "../../../../../../../actions";
export default (Base) => class OpacityController extends React.PureComponent {
    constructor() {
        super(...arguments);
        this.onChange = value => {
            this.props.dispatch(cssPropertyChanged("opacity", value));
        };
        this.onChangeComplete = value => {
            this.props.dispatch(cssPropertyChangeCompleted("opacity", value));
        };
    }
    render() {
        const { onChange, onChangeComplete } = this;
        const { computedStyleInfo } = this.props;
        return (React.createElement(Base, { sliderInputProps: {
                min: 0,
                max: 1,
                value: Number(computedStyleInfo.style.opacity == null
                    ? 1
                    : computedStyleInfo.style.opacity),
                onChange,
                onChangeComplete
            } }));
    }
};
//# sourceMappingURL=opacity-controller.js.map