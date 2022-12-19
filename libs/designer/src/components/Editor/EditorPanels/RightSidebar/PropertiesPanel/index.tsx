import React, { useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useSelector } from "@paperclip-ui/common";
import { getSelectedExpression } from "@paperclip-ui/designer/src/state/pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { VariantsSection } from "./VariantsSection";

export const PropertiesPanel = () => {
  const expr = useSelector(getSelectedExpression);

  if (!expr) {
    return null;
  }

  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection>
        <sidebarStyles.SidebarPanelContent>
          <inputStyles.Fields>
            {ast.isComponent(expr) && <VariantsSection />}
          </inputStyles.Fields>
        </sidebarStyles.SidebarPanelContent>
      </sidebarStyles.SidebarSection>
    </sidebarStyles.SidebarPanel>
  );
};
