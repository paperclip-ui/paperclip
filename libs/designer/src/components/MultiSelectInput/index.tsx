import React, { useMemo } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import cx from "classnames";
import { SuggestionMenu, SuggestionMenuItem } from "../SuggestionMenu";
import { noop } from "lodash";

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
    return options
      .filter((option) => {
        return values.includes(option.props.value);
      })
      .map((option) => {
        return (
          <inputStyles.MultiSelectItem>
            {option.props.label}
          </inputStyles.MultiSelectItem>
        );
      });
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
        <inputStyles.MultiSelectTextInput />
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
