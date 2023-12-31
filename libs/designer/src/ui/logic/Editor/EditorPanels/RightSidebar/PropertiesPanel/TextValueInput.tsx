import { useDispatch, useSelector } from "@paperclip-ui/common";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getSelectedExpressionInfo } from "@paperclip-ui/designer/src/state";
import { Field } from "@paperclip-ui/designer/src/ui/input.pc";
import { ast } from "@paperclip-ui/core/lib/src/proto/ast/pc-utils";
import React from "react";

export const TextValueField = () => {
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
