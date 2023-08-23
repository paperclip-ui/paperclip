import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getSelectedExpressionInfo,
  getExprBounds,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { VariantsSection } from "./VariantsSection";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import {
  Atom,
  Component,
  Element,
  Style,
  TextNode,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getEditorState } from "@paperclip-ui/designer/src/state";
import { FrameSection } from "./FrameSection";
import { ExprTagNameField } from "./TagInput";
import { AttributesSection } from "./AttributesSection";
import { UsedBySection } from "./UsedBySection";

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
            <IDField expr={expr} />
            <ExprTagNameField expr={expr} />
            {expr.kind === ast.ExprKind.Component && <VariantsSection />}
          </inputStyles.Fields>
        </sidebarStyles.SidebarPanelContent>
      </sidebarStyles.SidebarSection>
      <AttributesSection />
      {bounds && <FrameSection bounds={bounds} />}
      <UsedBySection />
    </sidebarStyles.SidebarPanel>
  );
};

type IDFieldProps = {
  expr: ast.InnerExpressionInfo;
};

const IDField = ({ expr }: IDFieldProps) => {
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = (value: string) => {
    dispatch({ type: "ui/idChanged", payload: { value } });
  };

  if (
    expr.kind !== ast.ExprKind.Element &&
    expr.kind !== ast.ExprKind.TextNode &&
    expr.kind !== ast.ExprKind.Atom &&
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
          value={expr.expr.name}
          onSave={onSave}
        />
      }
    />
  );
};
