import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useSelector } from "@paperclip-ui/common";
import {
  getSelectedExpression,
  getSelectedExprStyles,
} from "@paperclip-ui/designer/src/machine/state/pc";

export const PropertiesPanel = () => {
  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection>
        <sidebarStyles.SidebarPanelContent>
          <inputStyles.Fields>
            <VariantsSection />
          </inputStyles.Fields>
        </sidebarStyles.SidebarPanelContent>
      </sidebarStyles.SidebarSection>
    </sidebarStyles.SidebarPanel>
  );
};

const VariantsSection = () => {
  const expr = useSelector(getSelectedExpression);

  return (
    <>
      <inputStyles.Field name="Variants" input={<inputStyles.TextInput />} />
      <inputStyles.Field
        input={
          <inputStyles.ListItemInput class="removable">
            isHover
          </inputStyles.ListItemInput>
        }
      />
      <inputStyles.Field
        input={
          <inputStyles.ListItemInput class="removable">
            isActive
          </inputStyles.ListItemInput>
        }
      />
      <inputStyles.Field input={<inputStyles.AddListItemButton />} />
    </>
  );
};
