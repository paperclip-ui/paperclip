import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/right-sidebar.pc";
import { StylePanel } from "./StylePanel";
import { PropertiesPanel } from "./PropertiesPanel";
import {
  DesignerState,
  getSelectedExpression,
  getSelectedExpressionInfo,
  getSelectedId,
} from "@paperclip-ui/designer/src/state";
import { useSelector } from "@paperclip-ui/common";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { SidebarContainer } from "../../../Sidebar";

export const RightSidebar = () => {
  const showUI = useSelector((state: DesignerState) => state.showRightsidebar);
  if (!showUI) {
    return null;
  }

  return (
    <SidebarContainer position="right">
      <styles.RightSidebar>
        <StylePanel />
        <PropertiesPanel />
      </styles.RightSidebar>
    </SidebarContainer>
  );
};
