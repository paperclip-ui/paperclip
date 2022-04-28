import * as React from "react";
import {
  cssPropertyChanged,
  cssPropertyChangeCompleted
} from "../../../../../../../actions";
import { Dispatch } from "redux";
import { SyntheticElement, ComputedStyleInfo } from "paperclip";
import { BaseOpacityPaneProps } from "./opacity.pc";

export type Props = {
  dispatch: Dispatch<any>;
  computedStyleInfo: ComputedStyleInfo;
};

export default (Base: React.ComponentClass<BaseOpacityPaneProps>) =>
  class OpacityController extends React.PureComponent<Props> {
    onChange = value => {
      this.props.dispatch(cssPropertyChanged("opacity", value));
    };
    onChangeComplete = value => {
      this.props.dispatch(cssPropertyChangeCompleted("opacity", value));
    };

    render() {
      const { onChange, onChangeComplete } = this;
      const { computedStyleInfo } = this.props;
      return (
        <Base
          sliderInputProps={{
            min: 0,
            max: 1,
            value: Number(
              computedStyleInfo.style.opacity == null
                ? 1
                : computedStyleInfo.style.opacity
            ),
            onChange,
            onChangeComplete
          }}
        />
      );
    }
  };
