import * as React from "react";
import {
  CSSBackgroundType,
  CSSBackground,
  CSSSolidBackground,
  CSSLinearGradientBackground,
  CSSImageBackground
} from "./state";
import * as cx from "classnames";
import { BaseBackgroundPickerProps } from "./view.pc";
import { ColorSwatchGroup } from "../../../../../../../../inputs/color/color-swatch-controller";

export type Props = {
  cwd: string;
  value: CSSBackground;
  onChange?: any;
  onChangeComplete?: any;
  swatchOptionGroups: ColorSwatchGroup[];
};

type State = {
  backgroundType: CSSBackgroundType;
  _backgroundType?: CSSBackgroundType;
};

export default (Base: React.ComponentClass<BaseBackgroundPickerProps>) =>
  class BackgroundPickerController extends React.PureComponent<Props, State> {
    state = {
      backgroundType: this.props.value.type
    };
    static getDerivedStateFromProps(nextProps: Props, prevState: State): State {
      let newState = prevState;

      if (nextProps.value.type !== prevState._backgroundType) {
        newState = {
          ...prevState,
          backgroundType: nextProps.value.type,
          _backgroundType: nextProps.value.type
        };
      }

      return newState === prevState ? prevState : null;
    }
    onTypeClick = (backgroundType: CSSBackgroundType) => {
      this.setState({ backgroundType });
    };
    render() {
      const {
        cwd,
        value,
        onChange,
        onChangeComplete,
        swatchOptionGroups,
        ...rest
      } = this.props;
      const { backgroundType } = this.state;
      const { onTypeClick } = this;
      if (!value) {
        return value;
      }
      return (
        <Base
          {...rest}
          variant={cx({
            solid: backgroundType === CSSBackgroundType.SOLID,
            linearGradient:
              backgroundType === CSSBackgroundType.LINEAR_GRADIENT,
            image: backgroundType === CSSBackgroundType.IMAGE
          })}
          solidToggleButtonProps={{
            onClick: () => onTypeClick(CSSBackgroundType.SOLID)
          }}
          linearGradientButtonProps={{
            onClick: () => onTypeClick(CSSBackgroundType.LINEAR_GRADIENT)
          }}
          imageToggleButtonProps={{
            onClick: () => onTypeClick(CSSBackgroundType.IMAGE)
          }}
          solidColorPickerProps={{
            value: value as CSSSolidBackground,
            onChange,
            onChangeComplete,
            swatchOptionGroups
          }}
          linearGradientPickerProps={{
            value: value as CSSLinearGradientBackground,
            onChange,
            onChangeComplete,
            swatchOptionGroups
          }}
          backgroundImagePickerProps={{
            cwd,
            value: value as CSSImageBackground,
            onChange,
            onChangeComplete
          }}
        />
      );
    }
  };
