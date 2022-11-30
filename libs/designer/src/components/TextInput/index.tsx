import React, { useEffect, useRef } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";

export type TextInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  onKeyPress: (event: React.KeyboardEvent<any>) => void;
  onFocus?: (event: React.FocusEvent<any>) => void;
  onBlur?: (event: React.FocusEvent<any>) => void;
  select?: boolean;
};

export const TextInput = ({
  value,
  onKeyPress,
  onChange,
  onFocus,
  onBlur,
  select,
}: TextInputProps) => {
  const ref = useRef<HTMLInputElement>();
  useEffect(() => {
    if (ref.current) {
      ref.current.value = value;
      console.log("CHANGE", value);
    }
  }, [value]);
  const onFocus2 = (event: any) => {
    if (select) {
      ref.current.select();
    }
    onFocus(event);
  };
  const onChange2 = (event: any) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };
  return (
    <styles.TextInput
      ref={ref}
      defaultValue={value}
      onFocus={onFocus2}
      onBlur={onBlur}
      onChange={onChange2}
      onKeyPress={onKeyPress}
    />
  );
};