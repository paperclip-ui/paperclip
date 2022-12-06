import React from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import {
  SuggestionMenu,
  SuggestionMenuItem,
  SuggestionMenuItemProps,
} from "../SuggestionMenu";

export type MultiSelectInputProps = {
  value: string[];
};

export const MultiSelectInput = () => {
  const menu = () => [
    <SuggestionMenuItem value="variant">Variant 1</SuggestionMenuItem>,
    <SuggestionMenuItem value="variant2">Variant 1</SuggestionMenuItem>,
    <SuggestionMenuItem value="variant3">Variant 1</SuggestionMenuItem>,
  ];

  const onChange = () => {};

  return (
    <SuggestionMenu onChange={onChange} values={[]} menu={menu}>
      <inputStyles.MultiSelect>
        <inputStyles.MultiSelectItem>Variant</inputStyles.MultiSelectItem>
        <inputStyles.MultiSelectItem>
          Another variant
        </inputStyles.MultiSelectItem>
        <inputStyles.MultiSelectTextInput />
      </inputStyles.MultiSelect>
    </SuggestionMenu>
  );
};
