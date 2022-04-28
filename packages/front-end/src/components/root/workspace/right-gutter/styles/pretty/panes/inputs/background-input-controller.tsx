import * as React from "react";
import { BaseBackgroundInputProps } from "./view.pc";
import { BackgroundPicker } from "./background/view.pc";
import { ColorSwatchGroup } from "../../../../../../../inputs/color/color-swatch-controller";
import { CSSBackground, stringifyCSSBackground } from "./background/state";

export type Props = {
  cwd: string;
  value: CSSBackground;
  onChange: any;
  onChangeComplete: any;
  swatchOptionGroups: ColorSwatchGroup[];
};

export default (Base: React.ComponentClass<BaseBackgroundInputProps>) =>
  class BackgroundInputController extends React.PureComponent<Props> {
    render() {
      const { value, cwd, ...rest } = this.props;
      return (
        <Base
          value={stringifyCSSBackground(value)}
          {...rest}
          backgroundPickerProps={null}
          renderColorPicker={props => (
            <BackgroundPicker {...props} cwd={cwd} value={value} />
          )}
        />
      );
    }
  };
