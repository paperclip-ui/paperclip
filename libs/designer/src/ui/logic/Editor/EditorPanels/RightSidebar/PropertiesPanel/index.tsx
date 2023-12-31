import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getSelectedExpressionInfo,
  getExprBounds,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/core/lib/src/proto/ast/pc-utils";
import { VariantsSection } from "./VariantsSection";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getEditorState } from "@paperclip-ui/designer/src/state";
import { FrameSection } from "./FrameSection";
import { ExprTagNameField } from "./TagInput";
import { AttributesSection } from "./AttributesSection";
import { UsedBySection } from "./UsedBySection";
import { TextValueField } from "./TextValueInput";
import { AtomValueField } from "./AtomValueInput";

export const PropertiesPanel = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const state = useSelector(getEditorState);

  if (!expr) {
    return null;
  }

  const bounds = getExprBounds(state);

  return (
    <sidebarStyles.SidebarPanel>
      <sidebarStyles.SidebarSection>
        <sidebarStyles.SidebarPanelContent>
          <inputStyles.Fields>
            <IDField />
            <TextValueField />
            <AtomValueField />
            <ExprTagNameField />
            <VariantsSection />
          </inputStyles.Fields>
        </sidebarStyles.SidebarPanelContent>
      </sidebarStyles.SidebarSection>
      <AttributesSection />
      {bounds && <FrameSection bounds={bounds} />}
      <UsedBySection />
    </sidebarStyles.SidebarPanel>
  );
};

const IDField = () => {
  const expr = useSelector(getSelectedExpressionInfo);
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = (value: string) => {
    dispatch({ type: "ui/idChanged", payload: { value } });
  };

  if (
    expr.kind !== ast.ExprKind.Element &&
    expr.kind !== ast.ExprKind.TextNode &&
    expr.kind !== ast.ExprKind.Atom &&
    expr.kind !== ast.ExprKind.Condition &&
    expr.kind !== ast.ExprKind.Style &&
    expr.kind !== ast.ExprKind.Slot &&
    expr.kind !== ast.ExprKind.Component
  ) {
    return null;
  }

  return (
    <inputStyles.Field
      name="Id"
      input={
        <TextInput
          placeholder="Undefined"
          value={getExprName(expr)}
          onSave={onSave}
        />
      }
    />
  );
};

const getExprName = (expr: ast.InnerExpressionInfo) => {
  switch (expr.kind) {
    case ast.ExprKind.Element:
    case ast.ExprKind.TextNode:
    case ast.ExprKind.Atom:
    case ast.ExprKind.Style:
    case ast.ExprKind.Slot:
    case ast.ExprKind.Component:
      return expr.expr.name;
    case ast.ExprKind.Condition:
      return expr.expr.property;
  }
};
