import React from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { Bounds } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import { useDispatch } from "@paperclip-ui/common";

const inputs = [
  { name: "x" },
  { name: "y" },
  { name: "width" },
  { name: "height" },
];

type FrameSectionProps = {
  bounds: Bounds;
};

export const FrameSection = ({ bounds }: FrameSectionProps) => {
  return (
    <sidebarStyles.SidebarSection>
      <sidebarStyles.SidebarPanelHeader>Frame</sidebarStyles.SidebarPanelHeader>
      <sidebarStyles.SidebarPanelContent>
        <inputStyles.Fields>
          {inputs.map((input) => {
            return (
              <PropInput key={input.name} name={input.name} bounds={bounds} />
            );
          })}
        </inputStyles.Fields>
      </sidebarStyles.SidebarPanelContent>
    </sidebarStyles.SidebarSection>
  );
};

type PropInputProps = {
  name: string;
  bounds: Bounds;
};

const PropInput = ({ name, bounds }: PropInputProps) => {
  const dispatch = useDispatch();

  const onChange = (value: string) => {
    dispatch({
      type: "ui/boundsChanged",
      payload: { newBounds: { ...bounds, [name]: parseInt(value) } },
    });
  };

  return (
    <inputStyles.Field
      name={name}
      input={<TextInput value={bounds[name]} onChange={onChange} />}
    />
  );
};
