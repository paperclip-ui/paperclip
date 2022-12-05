import React from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";

export const Variants = () => {
  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Field name="Variant" input={<TextInput />} />
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};
