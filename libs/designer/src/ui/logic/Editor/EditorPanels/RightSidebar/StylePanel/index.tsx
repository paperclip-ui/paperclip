import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import { Variants } from "./Variants";
import { Declarations } from "./Declarations";
import {
  getSelectedExpressionInfo,
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
      {/* <InstanceVariants /> */}
      <Mixins />
      <Declarations />
    </sidebarStyles.SidebarPanel>
  );
};
