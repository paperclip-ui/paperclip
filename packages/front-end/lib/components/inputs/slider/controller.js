import { clamp } from "lodash";
import * as React from "react";
import { startDOMDrag } from "tandem-common";
const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;
const getPercent = ({ min = DEFAULT_MIN, max = DEFAULT_MAX, value }) => {
    return clamp((value || 0) / (max - min), 0, 1);
};
export default (Base) => class SliderController extends React.PureComponent {
    constructor(props) {
        super(props);
        this.setPercent = (value) => {
            this.setState(Object.assign(Object.assign({}, this.state), { percent: value }));
        };
        this.setSlider = (slider) => {
            this._slider = slider;
        };
        this.onMouseDown = event => {
            const { min = DEFAULT_MIN, max = DEFAULT_MAX, onChange, onChangeComplete } = this.props;
            const changeCallback = callback => {
                return (event) => {
                    const sliderRect = this._slider.getBoundingClientRect();
                    const relativeLeft = event.clientX - sliderRect.left;
                    let percent = relativeLeft / sliderRect.width;
                    const change = max - min;
                    percent = clamp(((relativeLeft / sliderRect.width) * change) / change, 0, 1);
                    percent = Number(percent.toFixed(3));
                    this.setPercent(percent);
                    if (callback) {
                        callback(percent);
                    }
                };
            };
            startDOMDrag(event, () => { }, changeCallback(onChange), changeCallback(onChangeComplete));
        };
        this.state = {
            percent: getPercent(props)
        };
    }
    componentWillUpdate(props) {
        if (props.value !== this.props.value) {
            this.setPercent(getPercent(props));
        }
    }
    render() {
        const { percent } = this.state;
        const { setSlider, onMouseDown } = this;
        return (React.createElement("span", { ref: setSlider },
            React.createElement(Base, { onMouseDown: onMouseDown, grabberProps: { style: { left: `${percent * 100}%` } } })));
    }
};
//# sourceMappingURL=controller.js.map