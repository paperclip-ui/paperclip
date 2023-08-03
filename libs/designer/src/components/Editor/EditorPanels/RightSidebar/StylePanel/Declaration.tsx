import React, { memo, useCallback, useRef, useState } from "react";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getSelectedId } from "@paperclip-ui/designer/src/state";
import { DeclarationValue } from "./DeclarationValue";
import { NewDeclValue, css, schema } from "./types";
import { noop } from "lodash";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { getPropField } from "./cssSchema";

type FieldProps = {
  name?: string;
  style?: ast.ComputedStyle;
  onValueTab?: (event: React.KeyboardEvent) => void;
  onSave?: () => void;
  isNewInput?: boolean;
};

export const Declaration = memo(
  ({
    name,
    style,
    onValueTab = noop,
    onSave: onSave2 = noop,
    isNewInput,
  }: FieldProps) => {
    const value = style && ast.serializeDeclaration(style.value);
    const [name2, setName] = useState(name);
    const [value2, setValue] = useState(value);
    const { input: inputOptions } = getPropField(name2);
    const ref = useRef(null);

    const onNameBlur = useCallback(() => {
      setTimeout(() => {
        if (ref.current.contains(document.activeElement) && name2 && value2) {
          if (!name2) {
            onSave2();
          }
        }
      });
    }, [name2, value2, ref]);

    const dispatch = useDispatch<DesignerEvent>();
    const targetId = useSelector(getSelectedId);

    const onSave = useCallback(
      ({ value, imports }: NewDeclValue) => {
        dispatch({
          type: "editor/styleDeclarationsChanged",
          payload: {
            values: { [name2]: value },
            imports,
          },
        });

        if (isNewInput) {
          onSave2();
        }
      },
      [name2, onSave2]
    );

    const nameInput = isNewInput ? (
      <TextInput onChange={setName} autoFocus onBlur={onNameBlur} />
    ) : (
      name
    );

    const input = (
      <DeclarationValue
        onChange={setValue}
        value={value}
        isDefault={style?.ownerId !== targetId}
        onSave={onSave}
        onTab={onValueTab}
        type={inputOptions.type}
        options={
          inputOptions.type === css.InputType.Enum ? inputOptions.options : []
        }
      />
    );

    // default field input
    return <inputStyles.Field ref={ref} name={nameInput} input={input} />;
  }
);
