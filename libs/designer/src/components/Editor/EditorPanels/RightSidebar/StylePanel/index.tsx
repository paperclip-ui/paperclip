import React, { memo, useCallback, useEffect, useRef } from "react";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { memoize, useDispatch, useSelector } from "@paperclip-ui/common";
import {
  ComputedDeclaration,
  getSelectedExprStyles,
} from "@paperclip-ui/designer/src/machine/state/pc";
import { editorEvents } from "@paperclip-ui/designer/src/machine/events";
import {
  Popover,
  PopoverMenuItem,
  PopoverMenuSection,
} from "@paperclip-ui/designer/src/components/Popover";

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
  },
  {
    name: "align-items",
    displayWhen: { name: "display", value: /flex/ },
    group: "layout",
    sticky: true,
    input: {
      name: "display",
      type: css.InputType.Enum,
      options: ["center"],
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
  },
  {
    name: "gap",
    displayWhen: { name: "display", value: /flex/ },
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
    input: { name: "background-image", type: css.InputType.Asset },
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

  const sortedStyle = [...style].sort((a, b) => {
    const ao = getPropField(a.name);
    const ab = getPropField(b.name);

    return cssSchema.indexOf(ao) > cssSchema.indexOf(ab) ? 1 : -1;
  });

  return (
    <commonStyles.SidebarSection>
      <commonStyles.SidebarPanelHeader>
        {name.charAt(0).toUpperCase() + name.substring(1)}
      </commonStyles.SidebarPanelHeader>
      <commonStyles.SidebarPanelContent>
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
      </commonStyles.SidebarPanelContent>
    </commonStyles.SidebarSection>
  );
};

type FieldProps = {
  name: string;
  style: ComputedDeclaration;
  options: schema.Field<css.Input>;
};

const Field = memo(
  ({ name, style, options: { input: inputOptions } }: FieldProps) => {
    const dispatch = useDispatch();

    const onChange = (value: string) => {
      dispatch(editorEvents.styleDeclarationsChanged({ [name]: value }));
    };

    const input = (
      <FieldInput
        value={style.value}
        onChange={onChange}
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
  value: string;
  options?: string[];
  onChange: (value: string) => void;
};

const FieldInput = ({ value, options, onChange }: FieldInputProps) => {
  const ref = useRef<HTMLInputElement>();
  useEffect(() => {
    if (ref.current) {
      ref.current.value = value;
    }
  }, [value]);

  const onKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === "Enter") {
      onChange(event.currentTarget.value);
    }
  };

  const onBlur = (event: React.KeyboardEvent<HTMLInputElement>) => {
    onChange(event.currentTarget.value);
  };

  const menu = useCallback(() => {
    const ops = options?.length
      ? [
          <PopoverMenuSection>Options</PopoverMenuSection>,
          ...options.map((option) => <PopoverMenuItem value={option} />),
        ]
      : [];

    return [...ops, <PopoverMenuSection>Tokens</PopoverMenuSection>];
  }, [options]);

  return (
    <Popover onChange={onChange} value={value} menu={menu}>
      <inputStyles.TextInput
        ref={ref}
        defaultValue={value}
        onKeyPress={onKeyPress}
        onBlur={onBlur}
      />
    </Popover>
  );
};

const useStylePanel = () => {
  const style = useSelector(getSelectedExprStyles);

  return {
    style,
  };
};
