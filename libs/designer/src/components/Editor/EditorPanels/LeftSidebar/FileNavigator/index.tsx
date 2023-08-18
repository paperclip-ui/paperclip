import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as etc from "@paperclip-ui/designer/src/styles/etc.pc";

export const FileNavigator = () => {
  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection>
        <sidebarStyles.SidebarPanelHeader>
          Files
          {/* <etc.PlusButton /> */}
        </sidebarStyles.SidebarPanelHeader>
        <styles.Layers>
          <styles.TreeNavigationItem>
            <styles.LayerNavigationItemHeader class="folder container open">
              components/
            </styles.LayerNavigationItemHeader>
            <styles.TreeNavigationItemContent>
              <styles.LayerNavigationItemHeader
                class="file open"
                style={{ "--depth": 2 }}
              >
                index.tsx
              </styles.LayerNavigationItemHeader>
            </styles.TreeNavigationItemContent>
          </styles.TreeNavigationItem>
        </styles.Layers>
      </sidebarStyles.SidebarSection>
    </sidebarStyles.SidebarPanel>
  );
};
