import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { Variants } from "./Variants";
import { Declarations } from "./Declarations";
import { InstanceVariants } from "./InstanceVariants";
import { getSelectedExpressionInfo } from "@paperclip-ui/designer/src/state";
import { useSelector } from "@paperclip-ui/common";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { Mixins } from "./Mixins";

export const StylePanel = () => {
  const expr = useSelector(getSelectedExpressionInfo);

  if (!expr) {
    return null;
  }

  if (
    expr.kind !== ast.ExprKind.Style &&
    expr.kind !== ast.ExprKind.Element &&
    expr.kind !== ast.ExprKind.TextNode
  ) {
    return null;
  }

  return (
    <sidebarStyles.SidebarPanel>
      <Variants />
      <InstanceVariants />
      <Mixins />
      <Declarations />
    </sidebarStyles.SidebarPanel>
  );
};
