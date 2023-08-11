import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { Element } from "@paperclip-ui/proto/lib/generated/ast/pc";

type AttributesSectionProps = {
  expr: Element;
};

export const AttributesSection = ({ expr }: AttributesSectionProps) => {
  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelHeader>
        Attributes
        <etcStyles.PlusButton />
      </sidebarStyles.SidebarPanelHeader>

      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields></inputStyles.Fields>
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};
