import React from "react";
import { useCallback } from "react";
import { CSS_PROP_NAMES } from "./cssSchema";
import {
  SuggestionMenu,
  SuggestionMenuItem,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";

type NameInputProps = {
  name: string;
  onChange: (value: string) => void;
};

export const NameInput = ({ name, onChange }: NameInputProps) => {
  const onSelect = useCallback(
    ([value]) => {
      onChange(value);
    },
    [onChange]
  );

  const menu = useCallback(() => {
    return CSS_PROP_NAMES.map((propName) => {
      return (
        <SuggestionMenuItem
          key={propName}
          value={propName}
          filterText={propName}
        />
      );
    });
  }, []);
  return (
    <SuggestionMenu values={[name]} menu={menu} onSelect={onSelect}>
      <TextInput autoFocus value={name} onChange={onChange} />
    </SuggestionMenu>
  );
};
