import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import { Layers } from "./Layers";
import { FileNavigator } from "./FileNavigator";
import { SidebarContainer } from "../../../Sidebar";
import { useSelector } from "@paperclip-ui/common";
import { DesignerState } from "@paperclip-ui/designer/src/state";

export const LeftSidebar = () => {
  const { show } = useLeftSidebar();
  if (!show) {
    return null;
  }

  return (
    <SidebarContainer position="left">
      <styles.LeftSidebar>
        <Layers />
        <FileNavigator />
      </styles.LeftSidebar>
    </SidebarContainer>
  );
};

const useLeftSidebar = () => {
  const show = useSelector((state: DesignerState) => state.showLeftSidebar);

  return {
    show,
  };
};
