import React from "react";
import { SuggestionMenu, SuggestionMenuItem } from "../../../../SuggestionMenu";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { LayerKind } from "@paperclip-ui/designer/src/state";
import { useDispatch } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";

export const AddLayerButton = () => {
  const dispatch = useDispatch<DesignerEvent>();

  const onChange = (values: LayerKind[]) => {
    dispatch({ type: "ui/AddLayerMenuItemClicked", payload: values[0] });
  };

  return (
    <SuggestionMenu
      values={[]}
      onChange={onChange}
      menu={() => [
        <SuggestionMenuItem value={LayerKind.Atom}>
          <styles.LayerIcon class="atom-token" />
          Atom
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Style}>
          <styles.LayerIcon class="composite-token" />
          Style mixin
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Element}>
          <styles.LayerIcon class="element" />
          Element
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Text}>
          <styles.LayerIcon class="text" />
          Text
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Component}>
          <styles.LayerIcon class="text" />
          Component
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Trigger}>
          <styles.LayerIcon class="trigger" />
          Trigger
        </SuggestionMenuItem>,
      ]}
    >
      <etcStyles.PlusButton />
    </SuggestionMenu>
  );
};
