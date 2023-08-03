import React, { memo, useCallback, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { getSelectedExprStyles } from "@paperclip-ui/designer/src/state/pc";
import { Variants } from "./Variants";
import { getPropField } from "./cssSchema";
import { Declaration } from "./Declaration";
import { NewDeclaration } from "./NewDeclaration";

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
  const [showNewDeclInput, setShowNewDeclInput] = useState(false);

  const dispatch = useDispatch();

  const onLastValueTab = useCallback(
    (event: React.KeyboardEvent) => {
      event.preventDefault();
      setShowNewDeclInput(true);
    },
    [setShowNewDeclInput]
  );

  const onSaveNewDeclaration = useCallback(
    (name: string, value: string) => {
      setShowNewDeclInput(false);
      if (name && value) {
        dispatch({
          type: "editor/styleDeclarationsChanged",
          payload: {
            values: { [name]: value },
            imports: {},
          },
        });
      }
    },
    [setShowNewDeclInput]
  );

  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelHeader>
        {name.charAt(0).toUpperCase() + name.substring(1)}
        <etcStyles.PlusButton />
      </sidebarStyles.SidebarPanelHeader>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields>
          {style.propertyNames.map((propertyName, i) => {
            const decl = style.map[propertyName];

            const options = getPropField(propertyName);
            const fieldName = options.name || propertyName;
            const isLast = i === style.propertyNames.length - 1;

            return (
              <Declaration
                name={fieldName}
                key={fieldName}
                style={decl}
                options={options}
                onValueTab={isLast ? onLastValueTab : undefined}
              />
            );
          })}
          {showNewDeclInput && <NewDeclaration onSave={onSaveNewDeclaration} />}
        </inputStyles.Fields>
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};

const useStylePanel = () => {
  const style = useSelector(getSelectedExprStyles);
  return {
    style,
  };
};
