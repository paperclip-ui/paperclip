import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import { ast } from "@paperclip-ui/proto-ext/lib/ast/pc-utils";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { memoize, useDispatch, useSelector } from "@paperclip-ui/common";
import {
  ComputedDeclaration,
  getSelectedExprStyles,
} from "@paperclip-ui/designer/src/state/pc";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import {
  SuggestionMenu,
  SuggestionMenuItem,
  SuggestionMenuSection,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";
import { getAllPublicAtoms, getCurrentDependency, getCurrentDocumentImports, getSelectedNodeId } from "@paperclip-ui/designer/src/state";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { Variants } from "./Variants";

namespace css {
  export enum InputType {
    Unit = "unit",
    Enum = "enum",
    Color = "color",
    Group = "group",
    Asset = "asset",
    Raw = "raw",
  }

  export type BaseInput<Type extends InputType> = {
    name?: string;
    type: Type;
  };

  export type UnitInput = BaseInput<InputType.Unit>;
  export type AssetInput = BaseInput<InputType.Asset>;
  export type RawInput = BaseInput<InputType.Raw>;
  export type ColorInput = BaseInput<InputType.Color>;
  export type GroupInput = { inputs: Input[] } & BaseInput<InputType.Group>;
  export type EnumInput = {
    options: string[];
  } & BaseInput<InputType.Enum>;

  export type Input =
    | UnitInput
    | AssetInput
    | RawInput
    | ColorInput
    | EnumInput
    | GroupInput;
}

namespace schema {
  type BaseInput = {};

  export type DisplayWhen = {
    name: string;
    value: RegExp;
  };

  export type Field<Input extends BaseInput> = {
    name?: string;
    group?: string;


    // alias property to use instead
    alias?: string;

    // Is this a list? E.g: background
    list?: boolean;

    // Properties to join together
    join?: Record<string, string[]>;

    input?: Input;
  };

  export type Map<Input extends BaseInput> = Field<Input>[];
}

const defaultOptions: schema.Field<css.Input> = {
  input: { type: css.InputType.Raw },
};

const cssSchema: schema.Map<css.Input> = [
  {
    name: "position",
    group: "layout",
    
    input: {
      name: "left",
      type: css.InputType.Enum,
      options: ["relative", "absolute", "static", "fixed"],
    },
  },
  {
    name: "left",
    group: "layout",
    
    input: { name: "left", type: css.InputType.Unit },
  },
  {
    name: "top",
    group: "layout",
    
    input: { name: "height", type: css.InputType.Unit },
  },
  {
    name: "width",
    group: "layout",
    
    input: { name: "width", type: css.InputType.Unit },
  },
  {
    name: "height",
    group: "layout",
    
    input: { name: "height", type: css.InputType.Unit },
  },

  // Padding
  { name: "padding-left", alias: "padding" },
  { name: "padding-top", alias: "padding" },
  { name: "padding-right", alias: "padding" },
  { name: "padding-bottom", alias: "padding" },
  {
    name: "padding",
    group: "layout",
    
    join: {
      padding: [
        "padding-left",
        "padding-right",
        "padding-top",
        "padding-bottom",
      ],
    },
    input: { name: "padding", type: css.InputType.Unit },
  },

  { name: "margin-left", alias: "margin" },
  { name: "margin-right", alias: "margin" },
  { name: "margin-top", alias: "margin" },
  { name: "margin-bottom", alias: "margin" },
  {
    name: "margin",
    group: "layout",
    
    join: {
      margin: ["margin-left", "margin-right", "margin-top", "margin-bottom"],
    },
    input: { name: "margin", type: css.InputType.Unit },
  },
  {
    name: "box-sizing",
    group: "layout",
    
    input: {
      name: "box-sizing",
      type: css.InputType.Enum,
      options: ["border-box", "content-box"],
    },
  },
  {
    name: "display",
    group: "layout",
    
    input: {
      name: "display",
      type: css.InputType.Enum,
      // https://www.w3schools.com/cssref/pr_class_display.php
      options: [
        "inline",
        "block",
        "contents",
        "flex",
        "grid",
        "inline-block",
        "inline-flex",
        "inline-grid",
        "inline-table",
        "list-item",
        "run-in",
        "table",
        "table-caption",
        "table-column-group",
        "table-header-group",
        "table-footer-group",
        "table-row-group",
        "table-cell",
        "table-column",
        "table-row",
        "none",
        "initial",
        "inherit",
      ],
    },
  },
  {
    name: "justify-content",
    group: "layout",
    
    input: {
      name: "justify-content",
      type: css.InputType.Enum,
      options: ["space-between"],
    },
  },
  {
    name: "align-items",
    group: "layout",
    
    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["flex-start", "flex-end", "center", "baseline", "stretch"],
    },
  },
  {
    name: "flex-direction",
    group: "layout",
    
    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["row", "column"],
    },
  },
  {
    name: "flex-wrap",
    group: "layout",
    
    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["nowrap", "wrap", "wrap-reverse", "inherit"],
    },
  },
  {
    name: "gap",
    group: "layout",
    
    input: { name: "gap", type: css.InputType.Unit },
  },

  {
    name: "font-family",
    group: "typography",
    
    input: { name: "font-family", type: css.InputType.Enum, options: [] },
  },
  {
    name: "font-size",
    group: "typography",
    
    input: { name: "font-size", type: css.InputType.Unit },
  },
  {
    name: "color",
    group: "typography",
    
    input: { name: "color", type: css.InputType.Color },
  },

  // Border
  { name: "border-left-width", alias: "border" },
  { name: "border-left-color", alias: "border" },
  {
    name: "border",
    
    join: {
      "border-width": [
        "border-left-width",
        "border-top-width",
        "border-right-width",
        "border-bottom-width",
      ],
      "border-color": [
        "border-left-color",
        "border-top-color",
        "border-right-color",
        "border-bottom-color",
      ],
      "border-radius": [
        "border-top-left-radius",
        "border-top-right-radius",
        "border-bottom-right-radius",
        "border-bottom-left-radius",
      ],
    },
    input: {
      type: css.InputType.Group,
      inputs: [
        { name: "border-color", type: css.InputType.Color },
        { name: "border-width", type: css.InputType.Unit },
        { name: "border-radius", type: css.InputType.Unit },
      ],
    },
  },

  { name: "background-color", alias: "background" },
  { name: "background-image", alias: "background" },
  { name: "background-repeat", alias: "background" },

  // Background
  {
    name: "background",
    
    list: true,
    input: { name: "background", type: css.InputType.Color },
  },
  defaultOptions,
];

export const StylePanel = () => {
  const { style } = useStylePanel();

  return (
    <sidebarStyles.SidebarPanel>
      <Variants />
      <GroupSection
          style={style}
          name="Style"
        />

    </sidebarStyles.SidebarPanel>
  );
};

const getPropField = memoize((name: string): schema.Field<css.Input> => {
  const options =
    cssSchema.find((option) => option.name === name) || defaultOptions;
  if (options.alias) {
    return getPropField(options.alias);
  }
  return options;
});

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
      </sidebarStyles.SidebarPanelHeader>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields>
          {style.propertyNames.map((propertyName) => {
            const decl = style.map[propertyName];

            const options = getPropField(propertyName);
            const fieldName = options.name || propertyName;

            return (
              <Field
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

type FieldProps = {
  name: string;
  style: ast.ComputedStyle;
  options: schema.Field<css.Input>;
};

const Field = memo(
  ({ name, style, options: { input: inputOptions } }: FieldProps) => {
    const dispatch = useDispatch<DesignerEvent>();
    const targetId = useSelector(getSelectedNodeId);

    const onSave = ({ value, imports }: NewDeclValue) => {
      dispatch({
        type: "editor/styleDeclarationsChanged",
        payload: {
          values: { [name]: value },
          imports,
        },
      });
    };

    console.log(targetId, style.ownerId)

    const input = (
      <FieldInput
        value={ast.serializeDeclaration(style.value)}
        isDefault={style.ownerId !== targetId}
        onSave={onSave}
        type={inputOptions.type}
        options={
          inputOptions.type === css.InputType.Enum ? inputOptions.options : []
        }
      />
    );

    // default field input
    return <inputStyles.Field name={name} input={input} />;
  }
);

type FieldInputProps = {
  value?: string;
  isDefault: boolean;
  options?: string[];
  onSave: (value: NewDeclValue) => void;
  type: css.InputType;
};

type NewDeclValue = {
  imports?: Record<string, string>;
  value: string;
};

const FieldInput = ({
  value,
  isDefault,
  options,
  type,
  onSave,
}: FieldInputProps) => {
  const tokens = useSelector(getAllPublicAtoms);
  const dep = useSelector(getCurrentDependency);
  const imports = useSelector(getCurrentDocumentImports);

  const internalValue = useRef<NewDeclValue>();

  const onChange = (values: any[]) => {
    const newValue = values[values.length - 1];
    onSave(newValue);
  };

  const onOtherChange = (value) => {
    onSave({ value });
  };

  useEffect(() => {
    internalValue.current = { value };
  }, [value]);

  const menu = useCallback(() => {
    const ops = options?.length
      ? [
          <SuggestionMenuSection>Options</SuggestionMenuSection>,
          ...options.map((option) => (
            <SuggestionMenuItem
              value={option}
              selectValue={{ value: option }}
              filterText={option}
            />
          )),
        ]
      : [];

    // no enum options
    const availableTokens = tokens
      .filter((token) => {
        const isColor = isColorValue(token.cssValue);
        const isUnit = isUnitValue(token.cssValue);

        if (type === css.InputType.Unit) {
          // https://www.w3schools.com/cssref/css_units.php
          return isUnit;
        } else if (type === css.InputType.Color) {
          // https://www.smashingmagazine.com/2021/11/guide-modern-css-colors/
          return isColor;
        } else if (type === css.InputType.Enum) {
          return !(isUnit || isColor);
        } else if (type === css.InputType.Asset) {
          return /url/.test(token.cssValue);
        }
      })
      .map((token) => {

        // use existing NS so that we have preselected value
        const tokenNs = imports.find(imp => {
          return dep.imports[imp.path] === token.dependency.path
        })?.namespace || "mod";

        const value = `var(${tokenNs}.${token.atom.name})`;


        return (
          <SuggestionMenuItem
            key={token.atom.id}
            value={value}
            selectValue={{
              value,
              imports: {
                [tokenNs]: token.dependency.path,
              },
            }}
            filterText={token.atom.name + token.cssValue + token.value}
          >
            <inputStyles.TokenMenuContent
              style={{ "--color": token.cssValue }}
              preview={token.value}
              file={token.dependency.path.split("/").pop()}
            >
              {token.atom.name}
            </inputStyles.TokenMenuContent>
          </SuggestionMenuItem>
        );
      });

    if (availableTokens.length) {
      ops.push(
        <SuggestionMenuSection>Tokens</SuggestionMenuSection>,
        ...availableTokens
      );
    }

    return ops;
  }, [options, tokens, onSave, dep, imports]);

  return (
    <SuggestionMenu
      onChange={onChange}
      onOtherChange={onOtherChange}
      values={[value]}
      menu={menu}
      style={{ width: 350 }}
    >
      <TextInput value={isDefault ? undefined : value} placeholder={isDefault ? value : undefined} select />
    </SuggestionMenu>
  );
};

const isUnitValue = (value) =>
  /(cm|mm|in|px|pt|pc|em|ex|ch|rem|vw|vh|vmin|vmax|%)/.test(value);
const isColorValue = (value) =>
  /(rgba?|hsla?|hwb|lab|lch|color|color-mix)\(/.test(value);

const useStylePanel = () => {
  const style = useSelector(getSelectedExprStyles);

  return {
    style,
  };
};
