import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/right-sidebar.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { StylePanel } from "./StylePanel";
import { PropertiesPanel } from "./PropertiesPanel";
import {
  DesignerState,
  getSelectedExpression,
} from "@paperclip-ui/designer/src/state";
import { useSelector } from "@paperclip-ui/common";

export const RightSidebar = () => {
  const showUI = useSelector((state: DesignerState) => state.showRightsidebar);
  const expr = useSelector(getSelectedExpression);
  if (!showUI || !expr) {
    return null;
  }

  return (
    <sidebarStyles.SidebarContainer position="right">
      <styles.RightSidebar>
        <StylePanel />
        <PropertiesPanel />
      </styles.RightSidebar>
    </sidebarStyles.SidebarContainer>
  );
};
