import * as React from "react";
import { EMPTY_ARRAY } from "tandem-common";
import { BaseColorInputProps, ElementProps } from "./view.pc";
import { ColorPicker } from "./picker.pc";
import {
  maybeConvertSwatchValueToColor,
  ColorSwatchGroup,
} from "./color-swatch-controller";

export type ColorPickerProps = {
  value: string;
  onChange: any;
  onChangeComplete: any;
  swatchOptionGroups: ColorSwatchGroup[];
};

export type Props = {
  value: string;
  onChange: any;
  onChangeComplete: any;
  swatchOptionGroups: ColorSwatchGroup[];
  renderColorPicker?: (props: ColorPickerProps) => any;
} & ElementProps;

export default (Base: React.ComponentClass<BaseColorInputProps>) =>
  class ColorInputController extends React.PureComponent<Props> {
    state = { open: false };
    onButtonClick = () => {
      this.setState({ ...this.state, open: !this.state.open });
    };
    onShouldClose = () => {
      this.setState({ ...this.state, open: false });
    };
    render() {
      let popdownChildren: any = EMPTY_ARRAY;
      const { open } = this.state;

      const {
        value,
        onChange,
        swatchOptionGroups,
        onChangeComplete,
        renderColorPicker,
        ...rest
      } = this.props;
      const { onButtonClick, onShouldClose } = this;

      if (open) {
        popdownChildren = renderColorPicker ? (
          renderColorPicker({
            value: value || "#FF0000",
            onChange,
            onChangeComplete,
            swatchOptionGroups,
          })
        ) : (
          <ColorPicker
            value={value || "#FF0000"}
            onChange={onChange}
            onChangeComplete={onChangeComplete}
            swatchOptionGroups={swatchOptionGroups}
          />
        );
      }

      return (
        <Base
          {...rest}
          buttonProps={{
            tabIndex: 0,
            onClick: onButtonClick,
            style: {
              background:
                maybeConvertSwatchValueToColor(value, swatchOptionGroups) ||
                "transparent",
              backgroundSize: "cover",
              backgroundRepeat: "no-repeat",
            },
          }}
          popoverProps={{
            open,
            onShouldClose,
          }}
          content={popdownChildren}
        />
      );
    }
  };
