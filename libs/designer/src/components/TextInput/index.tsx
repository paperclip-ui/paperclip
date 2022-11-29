import React, { useRef } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";

export type TextInputProps = {
  value: string;
  onChange: (value: string) => void;
  onFocus?: () => void;
  onBlur?: () => void;
};

export const TextInput = ({
  value,
  onChange,
  onFocus,
  onBlur,
}: TextInputProps) => {
  const ref = useRef<HTMLInputElement>();
  return (
    <styles.TextInput
      ref={ref}
      defaultValue={value}
      onFocus={onFocus}
      onBlur={onBlur}
    />
  );
};
