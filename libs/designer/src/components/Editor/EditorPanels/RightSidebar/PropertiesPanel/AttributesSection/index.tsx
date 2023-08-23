import React, { useCallback, useMemo, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { Parameter } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getAllComponents,
  getStyleableTarget,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { SuggestionMenu } from "@paperclip-ui/designer/src/components/SuggestionMenu";

type AttributesSectionProps = {};

export const AttributesSection = () => {
  const expr = useSelector(getStyleableTarget);
  const [showNew, setShowNew] = useState(false);
  const onNewClick = useCallback(() => {
    setShowNew(true);
  }, []);
  const onSaveNew = useCallback(() => {
    setShowNew(false);
  }, []);
  if (!expr || expr.kind !== ast.ExprKind.Element) {
    return null;
  }

  const attrs = expr.expr.parameters.map((param) => {
    return <Attribute key={param.id} parameter={param} />;
  });

  if (showNew) {
    attrs.push(
      <Attribute
        key={attrs.length}
        onSaveNew={onSaveNew}
        elementTagName={expr.expr.tagName}
      />
    );
  }

  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelHeader>
        Attributes
        <etcStyles.PlusButton onClick={onNewClick} />
      </sidebarStyles.SidebarPanelHeader>

      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields>{attrs}</inputStyles.Fields>
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};

type AttributeProps = {
  elementTagName?: string;
  parameter?: Parameter;
  onSaveNew?: () => void;
};

const Attribute = ({
  elementTagName = "div",
  parameter,
  onSaveNew,
}: AttributeProps) => {
  const isNew = parameter == null;
  const value = parameter?.value;

  const [name, setName] = useState(parameter?.name);
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = useCallback(
    (value: string) => {
      dispatch({
        type: "ui/attributeChanged",
        payload: {
          attributeId: parameter?.id,
          name,
          value,
        },
      });

      if (isNew) {
        onSaveNew();
      }
    },
    [onSaveNew, parameter, isNew, name]
  );

  const name2 = isNew ? (
    <NameInput tagName={elementTagName} onSave={setName} />
  ) : (
    name
  );
  let value2: string =
    value &&
    String(
      value.num?.value ||
        value.str?.value ||
        value.reference?.path.join(".") ||
        value.bool?.value
    );

  if (value?.str) {
    value2 = `"${value2}"`;
  }

  return (
    <inputStyles.Field
      name={name2}
      input={<TextInput value={value2} onSave={onSave} />}
    />
  );
};

type NameInputProps = {
  tagName: string;
  onSave: (value: string) => void;
};

const NameInput = ({ tagName, onSave }: NameInputProps) => {
  const components = useSelector(getAllComponents);
  const selectedComponent = useMemo(() => {
    return components.find((component) => component.component.name === tagName);
  }, [tagName, components]);

  const onSelect = useCallback(
    ([value]) => {
      const propNames = selectedComponent
        ? ast.getComponentPropNames(selectedComponent.component)
        : NATIVE_PROP_NAMES[tagName] || [];
    },
    [onSave]
  );
  const onOtherSelect = onSave;

  const menu = useCallback(() => {
    return [];
  }, [tagName, selectedComponent]);
  return (
    <SuggestionMenu
      values={[]}
      menu={menu}
      onSelect={onSelect}
      onOtherSelect={onOtherSelect}
    >
      <TextInput autoFocus />
    </SuggestionMenu>
  );
};

const GLOBAL_ATTRIBUTE_NAMES = [
  "accesskey",
  "class",
  "contenteditable",
  "dir",
  "draggable",
  "hidden",
  "id",
  "lang",
  "spellcheck",
  "style",
  "style",
  "tabindex",
  "title",
  "translate",
];

const NATIVE_PROP_NAMES = {
  img: [
    "alt",
    "crossorigin",
    "height",
    "ismap",
    "loading",
    "longdesc",
    "referrerpolicy",
    "sizes",
    "src",
    "srcset",
    "usemap",
    "width",
  ],
  div: [...GLOBAL_ATTRIBUTE_NAMES, "title", "tabindex"],
};
