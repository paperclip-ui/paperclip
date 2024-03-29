import React, { useMemo } from "react";
import * as inputStyles from "./ui.pc";

import { SuggestionMenu, SuggestionMenuItem } from "../SuggestionMenu";

export type MultiSelectInputProps = {
  values: string[];
  placeholder: string;
  children: React.ReactElement[];
  onChange: (values: any[]) => void;
};

export const MultiSelectInput = ({
  children: options,
  placeholder,
  values,
  onChange,
}: MultiSelectInputProps) => {
  const pills = useMemo(() => {
    return values
      .map((value) => {
        const option = options.find((option) => option.props.value === value);
        if (!option) {
          return null;
        }

        return (
          <inputStyles.MultiSelectItem key={value}>
            {option.props.label}
          </inputStyles.MultiSelectItem>
        );
      })
      .filter(Boolean);
  }, [options, values]);

  return (
    <SuggestionMenu
      multi
      onSelect={onChange}
      values={values}
      menu={() => options}
    >
      <inputStyles.MultiSelect
        placeholder={pills.length === 0 ? placeholder : null}
      >
        {pills}
        {/* <inputStyles.MultiSelectTextInput /> */}
      </inputStyles.MultiSelect>
    </SuggestionMenu>
  );
};

export type MultiSelectOptionProps = {
  label: any;
  value: string;
  children?: any;
};

export const MultiSelectOption = ({
  value,
  children,
  label,
  ...rest
}: MultiSelectOptionProps) => (
  <SuggestionMenuItem value={value} {...rest} checked>
    {children || label}
  </SuggestionMenuItem>
);
