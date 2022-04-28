import * as React from "react";
import { BaseLinearGradientPickerProps, ColorStop } from "./view.pc";
import { CSSLinearGradientBackground, stringifyCSSBackground } from "./state";
import { ColorSwatchGroup } from "../../../../../../../../inputs/color/color-swatch-controller";

export type Props = {
  value: CSSLinearGradientBackground;
  onChange?: any;
  onChangeComplete?: any;
  swatchOptionGroups: ColorSwatchGroup[];
};

export default (Base: React.ComponentClass<BaseLinearGradientPickerProps>) =>
  class BackgroundGradientPickerController extends React.PureComponent<Props> {
    render() {
      const {
        value,
        onChange,
        onChangeComplete,
        swatchOptionGroups,
        ...rest
      } = this.props;
      return (
        <Base
          {...rest}
          sliderProps={{
            children: [],
            style: {
              backgroundImage: stringifyCSSBackground(value)
            }
          }}
          colorPickerProps={{
            value: "rgba(0,0,0,0)",
            onChange,
            onChangeComplete,
            swatchOptionGroups
          }}
        />
      );
    }
  };
