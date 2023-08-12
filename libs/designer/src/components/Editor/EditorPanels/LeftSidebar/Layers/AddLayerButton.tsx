import React from "react";
import { SuggestionMenu, SuggestionMenuItem } from "../../../../SuggestionMenu";
import * as styles from "@paperclip-ui/designer/src/styles/left-sidebar.pc";
import * as etcStyles from "@paperclip-ui/designer/src/styles/etc.pc";

// enum LayerKind {
//     Atom,
//     StlyeMixin,
//     Element,
//     Text
// }

// const MENU_OPTIONS = [
//     {}
// ]

export const AddLayerButton = () => {
  return (
    <SuggestionMenu
      values={[]}
      menu={() => [
        <SuggestionMenuItem value="Atom">
          <styles.LayerIcon class="atom-token" />
          Atom
        </SuggestionMenuItem>,
        <SuggestionMenuItem value="Style mixin">
          <styles.LayerIcon class="composite-token" />
          Style mixin
        </SuggestionMenuItem>,
        <SuggestionMenuItem value="Element">
          <styles.LayerIcon class="element" />
          Element
        </SuggestionMenuItem>,
        <SuggestionMenuItem value="Text node">
          <styles.LayerIcon class="text" />
          Text
        </SuggestionMenuItem>,
      ]}
    >
      <etcStyles.PlusButton />
    </SuggestionMenu>
  );
};
