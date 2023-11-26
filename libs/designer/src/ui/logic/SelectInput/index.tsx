import React, { ReactElement, useCallback, useMemo } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { SuggestionMenu, SuggestionMenuItem } from "../SuggestionMenu";
import { noop } from "lodash";

type SelectInputProps = {
  children: ReactElement<SelectOptionProps>[];
  value: any;
  onChange: (value: any) => void;
};

export const SelectInput = ({
  onChange,
  value,
  children: options,
}: SelectInputProps) => {
  const onSelect = useCallback(
    (values) => {
      onChange(values[0]);
    },
    [onChange]
  );

  const selectedOption = options.find((option) => option.props.value === value);

  return (
    <SuggestionMenu menu={() => options} values={[value]} onSelect={onSelect}>
      <inputStyles.Select
        rootPropsProps={{tabIndex: -1}}
        value={selectedOption?.props.label ?? selectedOption?.props.value}
      />
    </SuggestionMenu>
  );
};

export type SelectOptionProps = {
  label: string;
  value: string;
  children?: any;
};

export const SelectOption = ({
  value,
  children,
  label,
  ...rest
}: SelectOptionProps) => (
  <SuggestionMenuItem value={value} {...rest} checked>
    {children || label}
  </SuggestionMenuItem>
);
