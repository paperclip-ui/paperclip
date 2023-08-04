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

type FieldProps = {
  name?: string;
  style?: ast.ComputedStyle;
  onValueTab?: (event: React.KeyboardEvent) => void;
  autoFocusValue?: boolean;
  onSave?: () => void;
};

export const Declaration = memo(
  ({
    name,
    style,
    onValueTab = noop,
    autoFocusValue,
    onSave: onSave2 = noop,
  }: FieldProps) => {
    const value = style && ast.serializeDeclaration(style.value);
    const { input: inputOptions } = getPropField(name);
    const dispatch = useDispatch<DesignerEvent>();
    const targetId = useSelector(getSelectedId);
    const ref = useRef(null);

    const onValueSelect = useCallback(
      ({ value, imports }: NewDeclValue) => {
        dispatch({
          type: "editor/styleDeclarationsChanged",
          payload: {
            values: { [name]: value },
            imports,
          },
        });
      },
      [name, onSave2]
    );

    const input = (
      <DeclarationValue
        value={value}
        isDefault={style?.ownerId !== targetId}
        onSelect={onValueSelect}
        onTab={onValueTab}
        type={inputOptions.type}
        autoFocus={autoFocusValue}
        options={
          inputOptions.type === css.InputType.Enum ? inputOptions.options : []
        }
      />
    );

    // default field input
    return <inputStyles.Field ref={ref} name={name} input={input} />;
  }
);
