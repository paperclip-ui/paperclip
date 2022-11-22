import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import { useSelector } from "@paperclip-ui/common";
import { getHistoryState } from "@paperclip-ui/designer/src/machine/engine/history/state";
import { getCurrentDependency } from "@paperclip-ui/designer/src/machine/state";

export const LeftSidebar = () => {
  const { title, document } = useLeftSidebar();

  if (!document) {
    return null;
  }

  return (
    <styles.LeftSidebar>
      <styles.LeftSidebarHeader title={title} />
      <commonStyles.SidebarSection>
        <commonStyles.SidebarPanelHeader>
          Layers
        </commonStyles.SidebarPanelHeader>
      </commonStyles.SidebarSection>
      <styles.Layers>
        {/* {document.body.map(item => {
        item.component.name
      })} */}
        <styles.LayerNavigationItemHeader
          class="component container open"
          style={{ "--depth": 1 }}
          controls={
            <styles.Tooltip>
              <styles.ShadowIcon />
            </styles.Tooltip>
          }
        ></styles.LayerNavigationItemHeader>
      </styles.Layers>
    </styles.LeftSidebar>
  );
};

const useLeftSidebar = () => {
  const history = useSelector(getHistoryState);
  const dependency = useSelector(getCurrentDependency);

  return {
    title: history.query.file.split("/").pop(),
    document: dependency?.document,
  };
};
