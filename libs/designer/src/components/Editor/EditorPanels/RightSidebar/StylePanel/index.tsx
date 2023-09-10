import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/components/Sidebar/sidebar.pc";
import { Variants } from "./Variants";
import { Declarations } from "./Declarations";
import { InstanceVariants } from "./InstanceVariants";
import {
  getSelectedExpressionInfo,
  isSelectableExpr,
  isStyleableExpr,
} from "@paperclip-ui/designer/src/state";
import { useSelector } from "@paperclip-ui/common";
import { Mixins } from "./Mixins";

export const StylePanel = () => {
  const expr = useSelector(getSelectedExpressionInfo);

  if (!expr || !isStyleableExpr(expr)) {
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
