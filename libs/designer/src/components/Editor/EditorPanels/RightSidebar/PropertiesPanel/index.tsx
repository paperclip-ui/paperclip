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
  TextNode,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { getEditorState } from "@paperclip-ui/designer/src/state";
import { FrameSection } from "./FrameSection";
import { MultiSelectInput } from "@paperclip-ui/designer/src/components/MultiSelectInput";
import {
  SelectInput,
  SelectOption,
} from "@paperclip-ui/designer/src/components/SelectInput";
import { TAG_NAMES } from "./constants";
import { AttributesSection } from "./AttributesSection";

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
            {expr.kind === ast.ExprKind.Element ||
            expr.kind === ast.ExprKind.TextNode ||
            expr.kind === ast.ExprKind.Atom ||
            expr.kind === ast.ExprKind.Slot ||
            expr.kind === ast.ExprKind.Component ? (
              <IDField expr={expr} />
            ) : null}
            {expr.kind === ast.ExprKind.Component && <VariantsSection />}
            {expr.kind === ast.ExprKind.Element && (
              <>
                <ElementTagField expr={expr} />
              </>
            )}
          </inputStyles.Fields>
        </sidebarStyles.SidebarPanelContent>
      </sidebarStyles.SidebarSection>
      {bounds && <FrameSection bounds={bounds} />}
      {/* {expr.kind === ast.ExprKind.Element && (
        <AttributesSection expr={expr.expr} />
      )} */}
    </sidebarStyles.SidebarPanel>
  );
};

type IDFieldProps = {
  expr:
    | ast.BaseExprInfo<Element, ast.ExprKind.Element>
    | ast.BaseExprInfo<TextNode, ast.ExprKind.TextNode>
    | ast.BaseExprInfo<Atom, ast.ExprKind.Atom>
    | ast.BaseExprInfo<Atom, ast.ExprKind.Slot>
    | ast.BaseExprInfo<Component, ast.ExprKind.Component>;
};

const IDField = ({ expr }: IDFieldProps) => {
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = (value: string) => {
    dispatch({ type: "ui/idChanged", payload: { value } });
  };

  return (
    <inputStyles.Field
      name="Id"
      input={<TextInput value={expr.expr.name} onSave={onSave} />}
    />
  );
};

const TAG_OPTIONS = TAG_NAMES.map((tag) => (
  <SelectOption key={tag} label={tag} value={tag} />
));

type ElemengTagFieldProps = {
  expr: ast.BaseExprInfo<Element, ast.ExprKind.Element>;
};

const ElementTagField = ({ expr }: ElemengTagFieldProps) => {
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = (value: string) => {
    dispatch({
      type: "ui/elementTagChanged",
      payload: { newTagName: value },
    });
  };

  return (
    <inputStyles.Field
      name="Tag"
      input={
        <SelectInput value={expr.expr.tagName} onChange={onSave}>
          {TAG_OPTIONS}
        </SelectInput>
      }
    />
  );
};
