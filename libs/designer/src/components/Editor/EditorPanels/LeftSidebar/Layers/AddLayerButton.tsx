import React from "react";
import { SuggestionMenu, SuggestionMenuItem } from "../../../../SuggestionMenu";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";
import { LayerKind } from "@paperclip-ui/designer/src/state";
import { useDispatch } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { noop } from "lodash";
import { Box } from "@paperclip-ui/designer/src/styles/layout.pc";

export const AddLayerButton = () => {
  const dispatch = useDispatch<DesignerEvent>();

  const onChange = (values: LayerKind[]) => {
    dispatch({ type: "ui/AddLayerMenuItemClicked", payload: values[0] });
  };

  return (
    <SuggestionMenu
      values={[]}
      onSelect={onChange}
      onOtherSelect={noop}
      menu={() => [
        <SuggestionMenuItem value={LayerKind.Atom}>
          <Box class="space03">
            <styles.LayerIcon class="atom-token" />
            Atom
          </Box>
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Style}>
          <Box class="space03">
            <styles.LayerIcon class="composite-token" />
            Style mixin
          </Box>
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Element}>
          <Box class="space03">
            <styles.LayerIcon class="element" />
            Element
          </Box>
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Text}>
          <Box class="space03">
            <styles.LayerIcon class="text" />
            Text
          </Box>
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Component}>
          <Box class="space03">
            <styles.LayerIcon class="component" />
            Component
          </Box>
        </SuggestionMenuItem>,
        <SuggestionMenuItem value={LayerKind.Trigger}>
          <Box class="space03">
            <styles.LayerIcon class="trigger" />
            Trigger
          </Box>
        </SuggestionMenuItem>,
      ]}
    >
      <etcStyles.PlusButton />
    </SuggestionMenu>
  );
};
