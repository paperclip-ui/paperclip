import React, { memo } from "react";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { memoize, useSelector } from "@paperclip-ui/common";
import {
  ComputedDeclaration,
  getSelectedExprStyles,
} from "@paperclip-ui/designer/src/machine/state/pc";

namespace css {
  export enum InputType {
    Unit = "unit",
    Enum = "enum",
    Color = "color",
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
  export type EnumInput = {
    options: string[];
  } & BaseInput<InputType.Enum>;

  export type Input =
    | UnitInput
    | AssetInput
    | RawInput
    | ColorInput
    | EnumInput;
}

namespace schema {
  type BaseInput = {};

  export type DisplayWhen = {
    name: string;
    value: string;
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

    inputs?: Input[];
  };

  export type Map<Input extends BaseInput> = Field<Input>[];
}

const cssSchema: schema.Map<css.Input> = [
  // Padding
  { name: "padding-left", alias: "padding" },
  { name: "padding-top", alias: "padding" },
  { name: "padding-right", alias: "padding" },
  { name: "padding-bottom", alias: "padding" },
  { name: "margin-left", alias: "margin" },
  { name: "margin-right", alias: "margin" },
  { name: "margin-top", alias: "margin" },
  { name: "margin-bottom", alias: "margin" },
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
    inputs: [{ name: "padding", type: css.InputType.Unit }],
  },
  {
    name: "margin",
    group: "layout",
    sticky: true,
    join: {
      margin: ["margin-left", "margin-right", "margin-top", "margin-bottom"],
    },
    inputs: [{ name: "margin", type: css.InputType.Unit }],
  },
  {
    name: "display",
    group: "layout",
    sticky: true,
    inputs: [
      // https://www.w3schools.com/cssref/pr_class_display.php
      {
        name: "display",
        type: css.InputType.Enum,
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
    ],
  },
  {
    name: "justify-content",
    displayWhen: { name: "display", value: "flex" },
    group: "layout",
    sticky: true,
    inputs: [
      {
        name: "display",
        type: css.InputType.Enum,
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
    ],
  },
  {
    name: "flex-direction",
    displayWhen: { name: "display", value: "flex" },
    group: "layout",
    sticky: true,
    inputs: [
      {
        name: "display",
        type: css.InputType.Enum,
        options: [
          "start",
          "end",
          "flex-start",
          "flex-end",
          "center",
          "left",
          "normal",
          "space-between",
          "space-around",
          "stretch",
        ],
      },
    ],
  },

  // Border
  { name: "border-left-width", alias: "border" },
  { name: "border-left-color", alias: "border" },
  {
    name: "border",
    group: "style",
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
    inputs: [
      { name: "border-color", type: css.InputType.Color },
      { name: "border-width", type: css.InputType.Unit },
      { name: "border-radius", type: css.InputType.Unit },
    ],
  },

  // Background
  {
    name: "background",
    list: true,
    inputs: [{ name: "background-image", type: css.InputType.Asset }],
  },
];

const defaultOptions: schema.Field<css.Input> = {
  inputs: [{ type: css.InputType.Raw }],
};

const GROUPS = {
  layout: (name: string) => getPropField(name).group === "layout",
  style: (name: string) => {
    return getPropField(name).group == null;
  },
};

export const StylePanel = () => {
  const { style } = useStylePanel();

  return (
    <commonStyles.SidebarPanel>
      {Object.keys(GROUPS).map((name) => (
        <GroupSection
          key={name}
          style={style.filter((style) => GROUPS[name](style.name))}
          name={name}
        />
      ))}
    </commonStyles.SidebarPanel>
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

  return (
    <commonStyles.SidebarSection>
      <commonStyles.SidebarPanelHeader>
        {name.charAt(0).toUpperCase() + name.substring(1)}
      </commonStyles.SidebarPanelHeader>
      <commonStyles.SidebarPanelContent>
        <inputStyles.Fields>
          {style.map((decl) => {
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
              style.find((decl2) => decl2.name === options.displayWhen?.name)
                ?.value !== options.displayWhen.value
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
      </commonStyles.SidebarPanelContent>
    </commonStyles.SidebarSection>
  );
};

type FieldProps = {
  name: string;
  style: ComputedDeclaration;
  options: schema.Field<css.Input>;
};

const Field = memo(({ name, style, options: { inputs } }: FieldProps) => {
  const input = <inputStyles.TextInput value={style.value} />;

  // default field input
  return <inputStyles.Field name={name || style.name} input={input} />;
});

const useStylePanel = () => {
  const style = useSelector(getSelectedExprStyles);

  return {
    style,
  };
};
