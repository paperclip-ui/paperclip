import React, { memo, useCallback, useRef, useState } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { DeclarationValue } from "./DeclarationValue";
import { getPropField } from "./cssSchema";
import { css } from "./types";

type NewDeclarationProps = {
  onSave: (name: string, value: string) => void;
};

export const NewDeclaration = memo(({ onSave }: NewDeclarationProps) => {
  const [name, setName] = useState(undefined);
  const [value, setValue] = useState(undefined);

  const fieldRef = useRef(null);

  const onSave2 = useCallback(() => {
    onSave(name, value);
  }, [name, value, fieldRef]);

  const onBlur = useCallback(() => {
    setTimeout(() => {
      if (!fieldRef.current.contains(document.activeElement)) {
        onSave2();
      }
    });
  }, [onSave2, fieldRef]);

  const onValueSave = useCallback(
    ({ value }) => {
      onSave(name, value);
    },
    [name, value]
  );

  const field = getPropField(name);

  // default field input
  return (
    <inputStyles.Field
      ref={fieldRef}
      name={
        <TextInput
          placeholder="name"
          autoFocus
          onChange={setName}
          onBlur={onBlur}
        />
      }
      input={
        <DeclarationValue
          value={value}
          placeholder="value"
          isDefault={false}
          onSave={onValueSave}
          type={field.input.type}
          options={
            field.input.type === css.InputType.Enum ? field.input.options : []
          }
        />
      }
    />
  );
});
type NewDeclaration = {
  imports?: Record<string, string>;
  value: string;
};
