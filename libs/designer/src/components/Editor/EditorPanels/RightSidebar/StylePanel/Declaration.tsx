import React, { memo } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getSelectedExprStyles } from "@paperclip-ui/designer/src/state/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getSelectedId } from "@paperclip-ui/designer/src/state";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { Variants } from "./Variants";
import { DeclarationValue } from "./DeclarationValue";
import { getPropField } from "./cssSchema";
import { NewDeclValue, css, schema } from "./types";

type FieldProps = {
  name: string;
  style: ast.ComputedStyle;
  options: schema.Field<css.Input>;
};

export const Declaration = memo(
  ({ name, style, options: { input: inputOptions } }: FieldProps) => {
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
