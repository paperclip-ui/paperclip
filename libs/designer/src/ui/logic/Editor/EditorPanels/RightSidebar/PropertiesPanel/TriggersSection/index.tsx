import React from "react";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getActiveVariant,
  getEditVariantPopupOpened,
  getSelectedExpression,
  getSelectedExpressionInfo,
} from "@paperclip-ui/designer/src/state/pc";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { Trigger } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { TriggersInput } from "../TriggersInput";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";

export const TriggersSection = () => {
  const expr = useSelector(getSelectedExpressionInfo);

  if (expr.kind !== ast.ExprKind.Trigger) {
    return null;
  }
  return <TriggersSectionInner />;
};

export const TriggersSectionInner = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = (triggers: UpdateVariantTrigger[]) => {
    dispatch({
      type: "designer/triggersEdited",
      payload: {
        triggers,
      },
    });
  };

  return (
    <>
      <TriggersInput onSave={onSave} triggers={(expr.expr as Trigger).body} />
    </>
  );
};
