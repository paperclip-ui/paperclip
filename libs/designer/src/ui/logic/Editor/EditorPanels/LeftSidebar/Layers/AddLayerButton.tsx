import React from "react";
import { SuggestionMenu, SuggestionMenuItem } from "../../../../SuggestionMenu";
import { LayerKind } from "@paperclip-ui/designer/src/state";
import { useDispatch } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import * as styles from "../ui.pc";
import { Box } from "@paperclip-ui/designer/src/ui/layout.pc";
import { BaseAddLayerButtonProps } from "../ui.pc";

export const AddLayerButton =
  (Base: React.FC<BaseAddLayerButtonProps>) => () => {
    const dispatch = useDispatch<DesignerEvent>();

    const onChange = (values: LayerKind[]) => {
      dispatch({ type: "ui/AddLayerMenuItemClicked", payload: values[0] });
    };

    return (
      <SuggestionMenu
        values={[]}
        onSelect={onChange}
        menu={() => [
          <SuggestionMenuItem value={LayerKind.Atom}>
            <Box className="space03">
              <styles.LayerIcon class="atom-token" />
              Atom
            </Box>
          </SuggestionMenuItem>,
          <SuggestionMenuItem value={LayerKind.Style}>
            <Box className="space03">
              <styles.LayerIcon class="composite-token" />
              Style mixin
            </Box>
          </SuggestionMenuItem>,
          <SuggestionMenuItem value={LayerKind.Element}>
            <Box className="space03">
              <styles.LayerIcon class="element" />
              Element
            </Box>
          </SuggestionMenuItem>,
          <SuggestionMenuItem value={LayerKind.Text}>
            <Box className="space03">
              <styles.LayerIcon class="text" />
              Text
            </Box>
          </SuggestionMenuItem>,
          <SuggestionMenuItem value={LayerKind.Component}>
            <Box className="space03">
              <styles.LayerIcon class="component" />
              Component
            </Box>
          </SuggestionMenuItem>,
          <SuggestionMenuItem value={LayerKind.Trigger}>
            <Box className="space03">
              <styles.LayerIcon class="trigger" />
              Trigger
            </Box>
          </SuggestionMenuItem>,
        ]}
      >
        <Base />
      </SuggestionMenu>
    );
  };
