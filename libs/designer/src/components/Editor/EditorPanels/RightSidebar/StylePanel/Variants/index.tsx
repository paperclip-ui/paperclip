import React from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { MultiSelectInput } from "@paperclip-ui/designer/src/components/MultiSelectInput";

export const Variants = () => {
  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Field name="variant" input={<MultiSelectInput />} />
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};
