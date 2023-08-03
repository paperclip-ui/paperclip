import React, { memo } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { useSelector } from "@paperclip-ui/common";
import { getSelectedExprStyles } from "@paperclip-ui/designer/src/state/pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { Variants } from "./Variants";
import { getPropField } from "./cssSchema";
import { Declaration } from "./Declaration";

export const StylePanel = () => {
  const { style } = useStylePanel();

  return (
    <sidebarStyles.SidebarPanel>
      <Variants />
      <GroupSection style={style} name="Style" />
    </sidebarStyles.SidebarPanel>
  );
};

type GroupSectionProps = {
  name: string;
  style: ast.ComputedStyleMap;
  rest?: boolean;
};

const GroupSection = ({ name, style }: GroupSectionProps) => {
  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelHeader>
        {name.charAt(0).toUpperCase() + name.substring(1)}
        <etcStyles.PlusButton />
      </sidebarStyles.SidebarPanelHeader>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields>
          {style.propertyNames.map((propertyName) => {
            const decl = style.map[propertyName];

            const options = getPropField(propertyName);
            const fieldName = options.name || propertyName;

            return (
              <Declaration
                name={fieldName}
                key={fieldName}
                style={decl}
                options={options}
              />
            );
          })}
        </inputStyles.Fields>
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};

const NewDeclField = memo(() => {
  // default field input
  return (
    <inputStyles.Field
      name={<TextInput placeholder="name" />}
      input={<TextInput placeholder="value" />}
    />
  );
});
type NewDeclValue = {
  imports?: Record<string, string>;
  value: string;
};

const useStylePanel = () => {
  const style = useSelector(getSelectedExprStyles);
  return {
    style,
  };
};
