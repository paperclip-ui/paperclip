import React, { useCallback, useEffect, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { useSelector } from "@paperclip-ui/common";
import { getSelectedExprStyles } from "@paperclip-ui/designer/src/state/pc";
import { Declaration } from "./Declaration";
import { getStyleableTargetId } from "@paperclip-ui/designer/src/state";
import { ComputedStyleMap } from "@paperclip-ui/proto-ext/lib/ast/serialize";

export const Declarations = () => {
  const { style, targetId } = useDeclarations();

  return <GroupSection targetId={targetId} style={style} name="Style" />;
};

type GroupSectionProps = {
  targetId: string;
  name: string;
  style: ComputedStyleMap;
  rest?: boolean;
};

const GroupSection = ({ targetId, name, style }: GroupSectionProps) => {
  const [focusedDeclIndex, setFocusedDeclIndex] = useState<number | null>(null);

  const onLastValueKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (event.key === "Tab" && !event.shiftKey) {
        event.preventDefault();
        setFocusedDeclIndex(style.propertyNames.length + 1);
      }
    },
    [focusedDeclIndex, style.propertyNames.length]
  );

  const onPlusClick = useCallback(() => {
    setFocusedDeclIndex(style.propertyNames.length + 1);
  }, [style.propertyNames.length]);

  useEffect(() => {
    setFocusedDeclIndex(null);
  }, [targetId]);

  const propNames = [...style.propertyNames];

  if (focusedDeclIndex != null && focusedDeclIndex >= propNames.length) {
    propNames.push(null);
  }

  const decls = propNames.map((propertyName, i) => {
    const decl = style.map[propertyName];
    const isLast = i === propNames.length - 1;
    const isNew = propertyName === null;

    return (
      <Declaration
        name={propertyName}
        key={targetId + "-" + i}
        isNew={isNew}
        style={decl}
        onValueKeyDown={isLast ? onLastValueKeyDown : undefined}
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

const useDeclarations = () => {
  const style = useSelector(getSelectedExprStyles);
  const targetId = useSelector(getStyleableTargetId);
  return {
    style,
    targetId,
  };
};
