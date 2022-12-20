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

  onBlur?: (event: React.FocusEvent<any>) => void;
  select?: boolean;
} & UseTextInputProps;

export const TextInput = (props: TextInputProps) => {
  const { autoFocus, placeholder, value, onBlur, onClick } = props;
  const { onFocus, onChange, ref, onKeyDown } = useTextInput(props);
  return (
    <styles.TextInput
      ref={ref}
      autoFocus={autoFocus}
      placeholder={placeholder}
      defaultValue={value}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={onChange}
      onClick={onClick}
      onKeyDown={onKeyDown}
    />
  );
};

export type UseTextInputProps = {
  value: string;
  onChange?: (value: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  select?: boolean;
};

export const useTextInput = ({
  value,
  select,
  onChange,
  onFocus,
  onEnter,
  onKeyDown,
}: UseTextInputProps) => {
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
    if (event.key === "Enter" && onEnter) {
      onEnter(event);
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  return {
    ref,
    onFocus: onFocus2,
    onKeyDown: onKeyDown2,
    onChange: onChange2,
  };
};
