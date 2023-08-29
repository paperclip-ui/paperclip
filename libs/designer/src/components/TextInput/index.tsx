import React, { forwardRef, useCallback, useEffect, useRef } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/input.pc";
import classNames from "classnames";

export type TextInputProps = {
  onClick?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  large?: boolean;
  onEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
  onKeyUp?: (event: React.KeyboardEvent<any>) => void;
  onBlur?: (event: React.FocusEvent<any>) => void;
  select?: boolean;
} & UseTextInputProps;

export const TextInput = forwardRef((props: TextInputProps, forwardRef) => {
  const { autoFocus, onKeyUp, placeholder, value, large, onClick } = props;
  const { onFocus, onChange, setRef, onBlur, onKeyDown } = useTextInput(
    props,
    forwardRef
  );

  return (
    <styles.TextInput
      ref={setRef}
      class={classNames({ large })}
      autoFocus={autoFocus}
      placeholder={placeholder}
      defaultValue={value}
      onFocus={onFocus}
      onBlur={onBlur}
      onChange={onChange}
      onClick={onClick}
      onKeyDown={onKeyDown}
      onKeyUp={onKeyUp}
    />
  );
});

export type UseTextInputProps = {
  value?: string;
  autoFocus?: boolean;
  onChange?: (value: string) => void;
  onFocus?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onEnter?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onKeyDown?: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  onBlur?: (event: React.FocusEvent<HTMLInputElement>) => void;
  onSave?: (value: string) => void;
  select?: boolean;
};

export const useTextInput = (
  {
    value,
    select,
    autoFocus,
    onChange,
    onFocus,
    onSave,
    onBlur,
    onEnter,
    onKeyDown,
  }: UseTextInputProps,
  forwardRef?: any
) => {
  const ref = useRef<HTMLInputElement>();
  useEffect(() => {
    if (ref.current) {
      ref.current.value = value || "";
    }
  }, [value]);
  const onFocus2 = (event: any) => {
    if (select) {
      setTimeout(() => {
        ref.current?.select();
      });
    }
    if (onFocus) {
      onFocus(event);
    }
  };
  const onBlur2 = (event: React.FocusEvent<HTMLInputElement>) => {
    if (onBlur) {
      onBlur(event);
    }

    if (onSave) {
      onSave(ref.current.value);
    }
  };
  const onChange2 = (event: any) => {
    if (onChange) {
      onChange(event.target.value);
    }
  };
  const onKeyDown2 = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      if (onEnter) {
        onEnter(event);
      }
      if (onSave) {
        onSave(ref.current.value);
      }
    }
    if (onKeyDown) {
      onKeyDown(event);
    }
  };

  useEffect(() => {
    if (autoFocus) {
      setTimeout(() => {
        ref.current.focus();
      });
    }
  }, [autoFocus]);

  const setRef = useCallback((ref2) => {
    if (forwardRef) {
      if (typeof forwardRef === "function") {
        forwardRef(ref2);
      } else {
        forwardRef.current = ref2;
      }
    }
    ref.current = ref2;
  }, []);

  return {
    setRef,
    onBlur: onBlur2,
    onFocus: onFocus2,
    onKeyDown: onKeyDown2,
    onChange: onChange2,
  };
};
