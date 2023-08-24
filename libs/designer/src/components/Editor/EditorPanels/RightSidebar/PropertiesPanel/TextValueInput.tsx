import { useDispatch, useSelector } from "@paperclip-ui/common";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getSelectedExpressionInfo } from "@paperclip-ui/designer/src/state";
import { Field } from "@paperclip-ui/designer/src/styles/input.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import React from "react";

export const TextValueInput = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = (value: string) => {
    dispatch({ type: "ui/textValueChanged", payload: value });
  };
  if (expr.kind !== ast.ExprKind.TextNode) {
    return null;
  }

  return (
    <Field
      name="Text"
      input={<TextInput value={expr.expr.value} onSave={onSave} select />}
    />
  );
};
