import React, { useCallback, useMemo, useRef, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import * as etcStyles from "@paperclip-ui/designer/src/ui/etc.pc";
import { Parameter } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import {
  getAllComponents,
  getStyleableTarget,
} from "@paperclip-ui/designer/src/state";
import { ast } from "@paperclip-ui/core/lib/proto/ast/pc-utils";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  SuggestionMenu,
  SuggestionMenuItem,
} from "@paperclip-ui/designer/src/ui/logic/SuggestionMenu";

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
  const valueRef = useRef<HTMLInputElement>();

  const [name, setName] = useState(parameter?.name);
  const dispatch = useDispatch<DesignerEvent>();
  const onNameSave = (value: string) => {
    setName(value);

    // hack to beat blur race condition

    setTimeout(() => {
      valueRef.current?.focus();
    }, 100);
  };

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
    <NameInput
      tagName={elementTagName}
      attrName={name}
      onChange={setName}
      onSave={onNameSave}
    />
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
      input={<TextInput ref={valueRef} value={value2} onSave={onSave} />}
    />
  );
};

type NameInputProps = {
  tagName: string;
  attrName: string;
  onChange: (value: string) => void;
  onSave: (value: string) => void;
};

const NameInput = ({ tagName, attrName, onChange, onSave }: NameInputProps) => {
  const components = useSelector(getAllComponents);
  const selectedComponent = useMemo(() => {
    return components.find((component) => component.component.name === tagName);
  }, [tagName, components]);

  const onSelect = useCallback(
    ([value]) => {
      onSave(value);
    },
    [onSave]
  );
  const onOtherSelect = onChange;

  const menu = useCallback(() => {
    const propNames = selectedComponent
      ? ast.getComponentPropNames(selectedComponent.component)
      : NATIVE_PROP_NAMES[tagName] || GLOBAL_ATTRIBUTE_NAMES;

    return propNames.map((propName) => {
      return (
        <SuggestionMenuItem
          key={propName}
          value={propName}
          filterText={propName}
        />
      );
    });
  }, [tagName, selectedComponent]);
  return (
    <SuggestionMenu values={[]} menu={menu} onSelect={onSelect}>
      <TextInput autoFocus value={attrName} onChange={onChange} />
    </SuggestionMenu>
  );
};

const KEYBOARD_EVENT_HANDLERS = ["onKeyDown", "onKeyPress", "onKeyUp"];
const MOUSE_EVENT_HANDLERS = [
  "onClick",
  "onContextMenu",
  "onDoubleClick",
  "onDrag",
  "onDragEnd",
  "onDragEnter",
  "onDragExit",
  "onDragLeave",
  "onDragOver",
  "onDragStart",
  "onDrop",
  "onMouseDown",
  "onMouseEnter",
  "onMouseLeave",
  "onMouseMove",
  "onMouseOut",
  "onMouseOver",
  "onMouseUp",
];

const ELEMENT_EVENT_HANDLERS = [
  ...KEYBOARD_EVENT_HANDLERS,
  ...MOUSE_EVENT_HANDLERS,
];

// https://www.w3schools.com/tags/ref_eventattributes.asp
const BASE_ATTRIBUTE_NAMES = [
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
  "tabindex",
  "title",
  "translate",
];

const GLOBAL_ATTRIBUTE_NAMES = [
  ...BASE_ATTRIBUTE_NAMES,
  ...ELEMENT_EVENT_HANDLERS,
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
};
