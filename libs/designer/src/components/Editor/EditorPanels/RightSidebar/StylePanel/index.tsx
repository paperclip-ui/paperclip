import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/styles-panel.pc";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";

export const StylePanel = () => {
  return (
    <commonStyles.SidebarPanel>
      <commonStyles.SidebarSection>
        <commonStyles.SidebarPanelHeader>
          Layout
        </commonStyles.SidebarPanelHeader>
        <commonStyles.SidebarPanelContent>
          <inputStyles.Fields>
            <inputStyles.Field
              name="display"
              input={
                <inputStyles.Select>
                  <inputStyles.Token class="keyword">flex</inputStyles.Token>
                </inputStyles.Select>
              }
            />
            <inputStyles.Field
              name="Padding"
              input={
                <inputStyles.Select>
                  <inputStyles.Token class="number">10</inputStyles.Token>
                  <inputStyles.Token class="unit">px</inputStyles.Token>
                </inputStyles.Select>
              }
            />
          </inputStyles.Fields>
        </commonStyles.SidebarPanelContent>
      </commonStyles.SidebarSection>
    </commonStyles.SidebarPanel>
  );
};
