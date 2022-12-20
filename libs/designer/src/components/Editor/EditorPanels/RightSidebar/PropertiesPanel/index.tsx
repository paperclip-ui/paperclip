import React, { useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getSelectedExpression } from "@paperclip-ui/designer/src/state/pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { VariantsSection } from "./VariantsSection";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { Element, TextNode } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

export const PropertiesPanel = () => {
  const expr = useSelector(getSelectedExpression);

  if (!expr) {
    return null;
  }

  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection>
        <sidebarStyles.SidebarPanelContent>
          <inputStyles.Fields>
            <IDField expr={expr} />
            {ast.isComponent(expr) && <VariantsSection />}
          </inputStyles.Fields>
        </sidebarStyles.SidebarPanelContent>
      </sidebarStyles.SidebarSection>
    </sidebarStyles.SidebarPanel>
  );
};

type IDFieldProps = {
  expr: TextNode | Element;
};

const IDField = ({ expr }: IDFieldProps) => {
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = (value: string) => {
    dispatch({ type: "ui/idChanged", payload: { value } });
  };

  return (
    <inputStyles.Field
      name="Id"
      input={<TextInput value={expr.name} onSave={onSave} />}
    />
  );
};
