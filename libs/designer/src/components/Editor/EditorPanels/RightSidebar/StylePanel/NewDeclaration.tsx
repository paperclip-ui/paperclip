import React, { memo, useCallback, useRef, useState } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { DeclarationValue } from "./DeclarationValue";
import { getPropField } from "./cssSchema";
import { css } from "./types";
import { useDispatch } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

type NewDeclarationProps = {
  onSave: () => void;
};

export const NewDeclaration = memo(
  ({ onSave: onSave2 }: NewDeclarationProps) => {
    const [name, setName] = useState(undefined);
    const dispatch = useDispatch<DesignerEvent>();

    const fieldRef = useRef(null);

    const onSave = useCallback(
      (name: string, value: string, imports: any) => {
        if (name && value) {
          dispatch({
            type: "editor/styleDeclarationsChanged",
            payload: {
              values: { [name]: value },
              imports,
            },
          });
        }
        onSave2();
      },
      [name, fieldRef]
    );

    const onSelectValue = useCallback(
      ({ value, imports }) => {
        onSave(name, value, imports);
      },
      [name]
    );

    const onBlur = useCallback(() => {
      if (!name) {
        onSave2();
      }
    }, [name]);

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
            placeholder="value"
            isDefault={false}
            onSelect={onSelectValue}
            type={field.input.type}
            options={
              field.input.type === css.InputType.Enum ? field.input.options : []
            }
          />
        }
      />
    );
  }
);
type NewDeclaration = {
  imports?: Record<string, string>;
  value: string;
};
