import React, { useCallback, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { useSelector } from "@paperclip-ui/common";
import { getSelectedExprStyles } from "@paperclip-ui/designer/src/state/pc";
import { Variants } from "./Variants";
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
  const [focusedDeclIndex, setFocusedDeclIndex] = useState<number | null>(null);

  const onLastValueTab = useCallback(
    (event: React.KeyboardEvent) => {
      event.preventDefault();
      setFocusedDeclIndex(style.propertyNames.length + 1);
    },
    [focusedDeclIndex, style.propertyNames.length]
  );

  const onPlusClick = useCallback(() => {
    setFocusedDeclIndex(style.propertyNames.length + 1);
  }, [style.propertyNames.length]);

  const propNames = [...style.propertyNames];

  if (focusedDeclIndex >= propNames.length) {
    propNames.push(null);
  }

  const decls = propNames.map((propertyName, i) => {
    const decl = style.map[propertyName];
    const isLast = i === propNames.length - 1;
    const isNew = propertyName === null;

    return (
      <Declaration
        name={propertyName}
        key={i}
        isNew={isNew}
        style={decl}
        onValueTab={isLast ? onLastValueTab : undefined}
        onFocus={() => setFocusedDeclIndex(i)}
        onBlur={isLast ? () => setFocusedDeclIndex(i - 1) : undefined}
      />
    );
  });

  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelHeader>
        {name.charAt(0).toUpperCase() + name.substring(1)}
        <etcStyles.PlusButton onClick={onPlusClick} />
      </sidebarStyles.SidebarPanelHeader>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields>{decls}</inputStyles.Fields>
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
