import React, { memo, useCallback, useRef, useState } from "react";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getSelectedId } from "@paperclip-ui/designer/src/state";
import { DeclarationValue } from "./DeclarationValue";
import { NewDeclValue, css, schema } from "./types";
import { noop } from "lodash";
import { getPropField } from "./cssSchema";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { SelectDetails } from "@paperclip-ui/designer/src/components/SuggestionMenu";

type FieldProps = {
  name?: string;
  style?: ast.ComputedStyle;
  onFocus?: () => void;
  onValueTab?: (event: React.KeyboardEvent) => void;
  onSave?: (details: SelectDetails) => void;
  isNew?: boolean;
};

export const Declaration = memo(
  ({
    name,
    style,
    onFocus = noop,
    onValueTab = noop,
    onSave = noop,
    isNew,
  }: FieldProps) => {
    const value = style && ast.serializeDeclaration(style.value);
    const [name2, setName] = useState(name);
    const { input: inputOptions } = getPropField(name2);
    const dispatch = useDispatch<DesignerEvent>();
    const targetId = useSelector(getSelectedId);
    const ref = useRef(null);

    const onValueSelect = useCallback(
      ({ value, imports }: NewDeclValue, details: SelectDetails) => {
        dispatch({
          type: "editor/styleDeclarationsChanged",
          payload: {
            values: { [name2]: value },
            imports,
          },
        });
        onSave(details);
      },
      [name2]
    );

    const nameInput = isNew ? (
      <TextInput value={name2} onChange={setName} autoFocus />
    ) : (
      name
    );

    const input = (
      <DeclarationValue
        value={value}
        isDefault={style?.ownerId !== targetId}
        onSelect={onValueSelect}
        onTab={onValueTab}
        type={inputOptions.type}
        options={
          inputOptions.type === css.InputType.Enum ? inputOptions.options : []
        }
      />
    );

    // default field input
    return (
      <inputStyles.Field
        ref={ref}
        onFocus={onFocus}
        name={nameInput}
        input={input}
      />
    );
  }
);
