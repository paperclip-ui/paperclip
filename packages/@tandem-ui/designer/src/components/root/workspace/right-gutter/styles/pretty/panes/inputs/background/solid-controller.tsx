import * as React from "react";
import { BaseSolidColorPickerProps } from "./view.pc";
import { CSSSolidBackground, CSSBackgroundType } from "./state";
import { ColorSwatchGroup } from "../../../../../../../../inputs/color/color-swatch-controller";

export type Props = {
  value: CSSSolidBackground;
  onChange?: any;
  onChangeComplete?: any;
  swatchOptionGroups: ColorSwatchGroup[];
};

export default (Base: React.ComponentClass<BaseSolidColorPickerProps>) =>
  class BackgroundPickerController extends React.PureComponent<Props> {
    onChange = (color: string) => {
      this.props.onChange({
        type: CSSBackgroundType.SOLID,
        color,
      } as CSSSolidBackground);
    };
    onChangeComplete = (color: string) => {
      this.props.onChangeComplete({
        type: CSSBackgroundType.SOLID,
        color,
      } as CSSSolidBackground);
    };
    render() {
      const { onChange, onChangeComplete } = this;
      const { value, swatchOptionGroups, ...rest } = this.props;
      return (
        <Base
          {...rest}
          colorPicker2Props={{
            value: value.color || "rgba(0,0,0,1)",
            onChange,
            onChangeComplete,
            swatchOptionGroups,
          }}
        />
      );
    }
  };
