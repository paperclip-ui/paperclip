import React, { memo } from "react";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getSelectedId } from "@paperclip-ui/designer/src/state";
import { DeclarationValue } from "./DeclarationValue";
import { NewDeclValue, css, schema } from "./types";
import { noop } from "lodash";

type FieldProps = {
  name: string;
  style: ast.ComputedStyle;
  options: schema.Field<css.Input>;
  onValueTab?: (event: React.KeyboardEvent) => void;
};

export const Declaration = memo(
  ({
    name,
    style,
    onValueTab = noop,
    options: { input: inputOptions },
  }: FieldProps) => {
    const dispatch = useDispatch<DesignerEvent>();
    const targetId = useSelector(getSelectedId);

    const onSave = ({ value, imports }: NewDeclValue) => {
      dispatch({
        type: "editor/styleDeclarationsChanged",
        payload: {
          values: { [name]: value },
          imports,
        },
      });
    };

    const input = (
      <DeclarationValue
        value={ast.serializeDeclaration(style.value)}
        isDefault={style.ownerId !== targetId}
        onSave={onSave}
        onTab={onValueTab}
        type={inputOptions.type}
        options={
          inputOptions.type === css.InputType.Enum ? inputOptions.options : []
        }
      />
    );

    // default field input
    return <inputStyles.Field name={name} input={input} />;
  }
);
