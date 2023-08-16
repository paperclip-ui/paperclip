import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { useSelector } from "@paperclip-ui/common";
import {
  DesignerState,
  getCurrentDependency,
  getCurrentFilePath,
} from "@paperclip-ui/designer/src/state";
import { useHistory } from "@paperclip-ui/designer/src/domains/history/react";
import { routes } from "@paperclip-ui/designer/src/state/routes";
import { Layers } from "./Layers";

export const LeftSidebar = () => {
  const { title, document, show, onBackClick } = useLeftSidebar();

  if (!document || !show) {
    return null;
  }

  return (
    <styles.LeftSidebar>
      <sidebarStyles.SidebarPanel>
        <styles.LeftSidebarHeader title={title} onBackClick={onBackClick} />
        <Layers />
      </sidebarStyles.SidebarPanel>
    </styles.LeftSidebar>
  );
};

const useLeftSidebar = () => {
  const currentFile = useSelector(getCurrentFilePath);
  const dependency = useSelector(getCurrentDependency);
  const show = useSelector((state: DesignerState) => state.showLeftSidebar);
  const history = useHistory();
  const onBackClick = () => {
    history.redirect(routes.dashboard());
  };

  return {
    show,
    onBackClick,
    title: currentFile.split("/").pop(),
    document: dependency?.document,
  };
};
