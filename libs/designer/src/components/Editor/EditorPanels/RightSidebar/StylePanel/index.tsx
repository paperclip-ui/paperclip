import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
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
import { getAllPublicAtoms } from "@paperclip-ui/designer/src/state";
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
    displayWhen?: DisplayWhen;

    sticky?: boolean;

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
    sticky: true,
    input: {
      name: "left",
      type: css.InputType.Enum,
      options: ["relative", "absolute", "static", "fixed"],
    },
  },
  {
    name: "left",
    group: "layout",
    displayWhen: { name: "position", value: /relative|absolute|fixed/ },
    sticky: true,
    input: { name: "left", type: css.InputType.Unit },
  },
  {
    name: "top",
    group: "layout",
    displayWhen: { name: "position", value: /relative|absolute|fixed/ },
    sticky: true,
    input: { name: "height", type: css.InputType.Unit },
  },
  {
    name: "width",
    group: "layout",
    sticky: true,
    input: { name: "width", type: css.InputType.Unit },
  },
  {
    name: "height",
    group: "layout",
    sticky: true,
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
    sticky: true,
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
    sticky: true,
    join: {
      margin: ["margin-left", "margin-right", "margin-top", "margin-bottom"],
    },
    input: { name: "margin", type: css.InputType.Unit },
  },
  {
    name: "box-sizing",
    group: "layout",
    sticky: true,
    input: {
      name: "box-sizing",
      type: css.InputType.Enum,
      options: ["border-box", "content-box"],
    },
  },
  {
    name: "display",
    group: "layout",
    sticky: true,
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
    displayWhen: { name: "display", value: /flex/ },
    group: "layout",
    sticky: true,
    input: {
      name: "justify-content",
      type: css.InputType.Enum,
      options: ["space-between"],
    },
  },
  {
    name: "align-items",
    displayWhen: { name: "display", value: /flex/ },
    group: "layout",
    sticky: true,
    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["flex-start", "flex-end", "center", "baseline", "stretch"],
    },
  },
  {
    name: "flex-direction",
    displayWhen: { name: "display", value: /flex/ },
    group: "layout",
    sticky: true,
    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["row", "column"],
    },
  },
  {
    name: "flex-wrap",
    displayWhen: { name: "display", value: /flex/ },
    group: "layout",
    sticky: true,
    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["nowrap", "wrap", "wrap-reverse", "inherit"],
    },
  },
  {
    name: "gap",
    displayWhen: { name: "display", value: /flex|grid/ },
    group: "layout",
    sticky: true,
    input: { name: "gap", type: css.InputType.Unit },
  },

  {
    name: "font-family",
    group: "typography",
    sticky: true,
    input: { name: "font-family", type: css.InputType.Enum, options: [] },
  },
  {
    name: "font-size",
    group: "typography",
    sticky: true,
    input: { name: "font-size", type: css.InputType.Unit },
  },
  {
    name: "color",
    group: "typography",
    sticky: true,
    input: { name: "color", type: css.InputType.Color },
  },

  // Border
  { name: "border-left-width", alias: "border" },
  { name: "border-left-color", alias: "border" },
  {
    name: "border",
    sticky: true,
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
    sticky: true,
    list: true,
    input: { name: "background", type: css.InputType.Color },
  },
  defaultOptions,
];

const GROUPS = {
  layout: (name: string) => getPropField(name).group === "layout",
  typography: (name: string) => getPropField(name).group === "typography",
  style: (name: string) => {
    return getPropField(name).group == null;
  },
};

export const StylePanel = () => {
  const { style } = useStylePanel();

  return (
    <sidebarStyles.SidebarPanel>
      <Variants />
      {Object.keys(GROUPS).map((name) => (
        <GroupSection
          key={name}
          style={style.filter((style) => GROUPS[name](style.name))}
          name={name}
        />
      ))}
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
  style: ComputedDeclaration[];
  rest?: boolean;
};

const GroupSection = ({ name, style }: GroupSectionProps) => {
  const used = {};

  const sortedStyle = [...style].sort((a, b) => {
    const ao = getPropField(a.name);
    const ab = getPropField(b.name);

    return cssSchema.indexOf(ao) > cssSchema.indexOf(ab) ? 1 : -1;
  });

  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelHeader>
        {name.charAt(0).toUpperCase() + name.substring(1)}
      </sidebarStyles.SidebarPanelHeader>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields>
          {sortedStyle.map((decl) => {
            const options = getPropField(decl.name);
            const fieldName = options.name || decl.name;
            if (used[fieldName] || !options) {
              return null;
            }

            used[fieldName] = true;

            if (!options.sticky && !decl.isExplicitlyDefined) {
              return null;
            }

            if (
              options.displayWhen &&
              !options.displayWhen.value.test(
                style.find((decl2) => decl2.name === options.displayWhen?.name)
                  ?.value || ""
              )
            ) {
              return null;
            }

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
  style: ComputedDeclaration;
  options: schema.Field<css.Input>;
};

const Field = memo(
  ({ name, style, options: { input: inputOptions } }: FieldProps) => {
    const dispatch = useDispatch<DesignerEvent>();

    const onSave = ({ value, imports }: NewDeclValue) => {
      dispatch({
        type: "editor/styleDeclarationsChanged",
        payload: {
          values: { [name]: value },
          imports,
        },
      });
    };

    const input = (
      <FieldInput
        computedValue={style.computedValue}
        explicitValue={style.explicitValue}
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
  computedValue: string;
  explicitValue?: string;
  options?: string[];
  onSave: (value: NewDeclValue) => void;
  type: css.InputType;
};

type NewDeclValue = {
  imports?: Record<string, string>;
  value: string;
};

const FieldInput = ({
  computedValue,
  explicitValue,
  options,
  type,
  onSave,
}: FieldInputProps) => {
  const tokens = useSelector(getAllPublicAtoms);
  const internalValue = useRef<NewDeclValue>();

  const onChange = (values: any[]) => {
    const newValue = values[values.length - 1];
    onSave(newValue);
  };

  const onOtherChange = (value) => {
    onSave({ value });
  };

  useEffect(() => {
    internalValue.current = { value: explicitValue };
  }, [explicitValue]);

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
        return (
          <SuggestionMenuItem
            key={token.atom.id}
            value={token.value}
            selectValue={{
              value: `var(mod.${token.atom.name})`,
              imports: {
                mod: token.dependency.path,
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
  }, [options, tokens, onSave]);

  return (
    <SuggestionMenu
      onChange={onChange}
      onOtherChange={onOtherChange}
      values={[computedValue]}
      menu={menu}
      style={{ width: 350 }}
    >
      <TextInput value={explicitValue} placeholder={computedValue} select />
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
