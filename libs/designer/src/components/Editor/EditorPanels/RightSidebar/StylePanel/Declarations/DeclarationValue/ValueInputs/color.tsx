import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/color-picker.pc";

type ColorInputProps = {
  value: string;
};

export const ColorInput = ({ value }: ColorInputProps) => {
  return <styles.ColorPicker />;
};
