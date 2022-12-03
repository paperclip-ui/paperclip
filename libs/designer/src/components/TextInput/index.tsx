import React, { useEffect, useRef } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";

export type TextInputProps = {
  value?: string;
  onChange?: (value: string) => void;
  onClick?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  onEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
  onFocus?: (event: React.FocusEvent<any>) => void;
  onBlur?: (event: React.FocusEvent<any>) => void;
  select?: boolean;
};

export const TextInput = ({
  value,
  onKeyDown,
  onChange,
  placeholder,
  onEnter,
  autoFocus,
  onClick,
  onFocus,
  onBlur,
  select,
}: TextInputProps) => {
  const ref = useRef<HTMLInputElement>();
  useEffect(() => {
    if (ref.current) {
      ref.current.value = value || "";
    }
  }, [value]);
  const onFocus2 = (event: any) => {
    if (select) {
      setTimeout(() => {
        ref.current.select();
      });
    }
    if (onFocus) {
      onFocus(event);
    }
  };
  const onChange2 = (event: any) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };
  const onKeyDown2 = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onEnter(event);
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };
  return (
    <styles.TextInput
      ref={ref}
      autoFocus={autoFocus}
      placeholder={placeholder}
      defaultValue={value}
      onFocus={onFocus2}
      onBlur={onBlur}
      onChange={onChange2}
      onClick={onClick}
      onKeyDown={onKeyDown2}
    />
  );
};
