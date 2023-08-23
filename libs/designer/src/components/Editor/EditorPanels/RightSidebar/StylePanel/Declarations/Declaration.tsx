import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getSelectedId } from "@paperclip-ui/designer/src/state";
import { DeclarationValue } from "./DeclarationValue";
import { NewDeclValue, css } from "./types";
import { noop } from "lodash";
import { getPropField } from "./cssSchema";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { SelectDetails } from "@paperclip-ui/designer/src/components/SuggestionMenu";
import {
  ComputedStyle,
  serializeDeclaration,
} from "@paperclip-ui/proto-ext/lib/ast/serialize";
import { NameInput } from "./NameInput";

type FieldProps = {
  name?: string;
  style?: ComputedStyle;
  onFocus?: () => void;
  onBlur?: () => void;
  onValueTab?: (event: React.KeyboardEvent) => void;
  onSave?: (details: SelectDetails) => void;
  isNew?: boolean;
};

export const Declaration = memo(
  ({
    name,
    style,
    onBlur = noop,
    onFocus = noop,
    onValueTab = noop,
    onSave = noop,
    isNew,
  }: FieldProps) => {
    const value = style && serializeDeclaration(style.value);
    const [name2, setName] = useState(name);
    const { input: inputOptions } = getPropField(name2);
    const dispatch = useDispatch<DesignerEvent>();
    const targetId = useSelector(getSelectedId);
    const ref = useRef(null);

    useEffect(() => {
      setName(name);
    }, [name]);

    const onValueSelect = useCallback(
      ({ value, imports }: NewDeclValue, details: SelectDetails) => {
        dispatch({
          type: "ui/styleDeclarationsChanged",
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
      <NameInput name={name2} onSave={setName} />
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

    const onBlur2 = (event) => {
      setTimeout(() => {
        if (ref.current.contains(document.activeElement)) {
          return;
        }
        onBlur();
      });
    };

    // default field input
    return (
      <inputStyles.Field
        ref={ref}
        onFocus={onFocus}
        onBlur={onBlur2}
        name={nameInput}
        input={input}
      />
    );
  }
);
