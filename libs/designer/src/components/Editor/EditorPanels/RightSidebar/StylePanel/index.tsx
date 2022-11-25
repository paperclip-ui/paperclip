import React from "react";
import * as commonStyles from "@paperclip-ui/designer/src/styles/common.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useSelector } from "@paperclip-ui/common";
import {
  ComputedDeclaration,
  getSelectedExprStyles,
} from "@paperclip-ui/designer/src/machine/state/pc";

namespace css {
  export enum InputType {
    Unit = "unit",
    Color = "color",
    Asset = "asset",
  }

  export type BaseInput<type extends InputType> = {
    type: InputType;
  };

  export type UnitInput = {
    name: string;
  } & BaseInput<InputType.Unit>;

  export type AssetInput = {
    name: string;
  } & BaseInput<InputType.Asset>;

  export type Input = UnitInput | AssetInput;
}

namespace schema {
  type BaseInput = {
    name: string;
  };

  export type Property<Input extends BaseInput> = {
    name: string;
    group?: string;

    // alias property to use instead
    alias?: string;

    // Is this a list? E.g: background
    list?: boolean;

    // Properties to join together
    join?: Record<string, string[]>;

    inputs?: Input[];
  };

  export type Map<Input extends BaseInput> = Property<Input>[];
}

const cssSchema: schema.Map<css.Input> = [
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
    inputs: [{ name: "padding", type: css.InputType.Unit }],
  },

  // Border
  { name: "border-left-width", alias: "border" },
  { name: "border-left-color", alias: "border" },
  {
    name: "border",
    group: "style",
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

export const StylePanel = () => {
  const { style } = useStylePanel();
  console.log(style);

  return (
    <commonStyles.SidebarPanel>
      <GroupSection name="layout" style={style} />
      <GroupSection name="style" style={style} />
    </commonStyles.SidebarPanel>
  );
};

type GroupSectionProps = {
  name: string;
  style: Record<string, ComputedDeclaration>;
};

const GroupSection = ({ name, style }: GroupSectionProps) => {
  return (
    <commonStyles.SidebarSection>
      <commonStyles.SidebarPanelHeader>
        {name.charAt(0).toUpperCase() + name.substring(1)}
      </commonStyles.SidebarPanelHeader>
      <commonStyles.SidebarPanelContent>
        <inputStyles.Fields></inputStyles.Fields>
      </commonStyles.SidebarPanelContent>
    </commonStyles.SidebarSection>
  );
};

const useStylePanel = () => {
  const style = useSelector(getSelectedExprStyles);

  return {
    style,
  };
};
