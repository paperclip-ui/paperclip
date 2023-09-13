import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/components/Sidebar/sidebar.pc";
import { Layers } from "./Layers";
import { FileNavigator } from "./FileNavigator";
import { useSelector } from "@paperclip-ui/common";
import { DesignerState } from "@paperclip-ui/designer/src/state";

export const LeftSidebar = () => {
  const { show } = useLeftSidebar();
  if (!show) {
    return null;
  }

  return (
    <sidebarStyles.SidebarContainer position="left">
      <styles.LeftSidebar>
        <Layers />
        <FileNavigator />
      </styles.LeftSidebar>
    </sidebarStyles.SidebarContainer>
  );
};

const useLeftSidebar = () => {
  const show = useSelector((state: DesignerState) => state.showLeftSidebar);

  return {
    show,
  };
};
