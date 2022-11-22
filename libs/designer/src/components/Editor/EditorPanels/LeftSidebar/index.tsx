import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import { useSelector } from "@paperclip-ui/common";
import { getHistoryState } from "@paperclip-ui/designer/src/machine/engine/history/state";

export const LeftSidebar = () => {
  const { title } = useLeftSidebar();

  return (
    <styles.LeftSidebar>
      <styles.LeftSidebarHeader title={title} />
      <commonStyles.SidebarSection>
        <commonStyles.SidebarPanelHeader>
          Layers
        </commonStyles.SidebarPanelHeader>
      </commonStyles.SidebarSection>
      <styles.Layers>
        <styles.LayerNavigationItemHeader
          class="component container open"
          style={{ "--depth": 1 }}
        >
          Some instance
        </styles.LayerNavigationItemHeader>
      </styles.Layers>
    </styles.LeftSidebar>
  );
};

const useLeftSidebar = () => {
  const history = useSelector(getHistoryState);

  return {
    title: history.query.file.split("/").pop(),
  };
};
