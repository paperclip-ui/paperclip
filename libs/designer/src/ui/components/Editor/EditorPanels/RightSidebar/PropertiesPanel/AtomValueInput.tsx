import { useDispatch, useSelector } from "@paperclip-ui/common";
import { TextInput } from "@paperclip-ui/designer/src/ui/components/TextInput";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getSelectedExpressionInfo } from "@paperclip-ui/designer/src/state";
import { Field } from "@paperclip-ui/designer/src/ui/input.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import React from "react";
import { DeclarationValue } from "../StylePanel/Declarations/DeclarationValue";

import { serializeDeclaration } from "@paperclip-ui/proto-ext/lib/ast/serialize";

export const AtomValueField = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const dispatch = useDispatch<DesignerEvent>();

  const onChangeComplete = (value: string, imports: Record<string, string>) => {
    dispatch({
      type: "ui/atomValueChangeCompleted",
      payload: { value, imports },
    });
  };

  const onChange = (value: string) => {
    dispatch({ type: "ui/atomValueChanged", payload: { value } });
  };

  if (expr.kind !== ast.ExprKind.Atom) {
    return null;
  }

  ast;

  return (
    <Field
      name="Text"
      input={
        <DeclarationValue
          value={serializeDeclaration(expr.expr.value)}
          onChangeComplete={onChangeComplete}
          onChange={onChange}
        />
      }
    />
  );
};
