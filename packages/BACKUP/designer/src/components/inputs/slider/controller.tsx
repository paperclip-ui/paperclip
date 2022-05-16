import { clamp } from "lodash";
import * as React from "react";
import { startDOMDrag } from "tandem-common";
import { compose, pure, withHandlers, withState } from "recompose";
import { BaseSliderProps } from "./view.pc";

const DEFAULT_MIN = 0;
const DEFAULT_MAX = 100;

export type Props = {
  value?: number;
  onChange: any;
  onChangeComplete: any;
  min?: number;
  max?: number;
};

type State = {
  percent: number;
};

const getPercent = ({ min = DEFAULT_MIN, max = DEFAULT_MAX, value }: Props) => {
  return clamp((value || 0) / (max - min), 0, 1);
};

export default (Base: React.ComponentClass<BaseSliderProps>) =>
  class SliderController extends React.PureComponent<Props, State> {
    _slider: HTMLDivElement;
    constructor(props: Props) {
      super(props);
      this.state = {
        percent: getPercent(props),
      };
    }
    setPercent = (value: number) => {
      this.setState({ ...this.state, percent: value });
    };
    setSlider = (slider: HTMLDivElement) => {
      this._slider = slider;
    };

    onMouseDown = (event) => {
      const {
        min = DEFAULT_MIN,
        max = DEFAULT_MAX,
        onChange,
        onChangeComplete,
      } = this.props;
      const changeCallback = (callback) => {
        return (event: MouseEvent) => {
          const sliderRect = this._slider.getBoundingClientRect();
          const relativeLeft = event.clientX - sliderRect.left;
          let percent = relativeLeft / sliderRect.width;
          const change = max - min;
          percent = clamp(
            ((relativeLeft / sliderRect.width) * change) / change,
            0,
            1
          );
          percent = Number(percent.toFixed(3));
          this.setPercent(percent);
          if (callback) {
            callback(percent);
          }
        };
      };

      startDOMDrag(
        event,
        () => {},
        changeCallback(onChange),
        changeCallback(onChangeComplete)
      );
    };

    componentWillUpdate(props: Props) {
      if (props.value !== this.props.value) {
        this.setPercent(getPercent(props));
      }
    }

    render() {
      const { percent } = this.state;
      const { setSlider, onMouseDown } = this;

      return (
        <span ref={setSlider}>
          <Base
            onMouseDown={onMouseDown}
            grabberProps={{ style: { left: `${percent * 100}%` } }}
          />
        </span>
      );
    }
  };
