import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";

export const FileNavigator = () => {
  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection>
        <sidebarStyles.SidebarPanelHeader>
          Files
        </sidebarStyles.SidebarPanelHeader>
        <styles.Layers></styles.Layers>
      </sidebarStyles.SidebarSection>
    </sidebarStyles.SidebarPanel>
  );
};
