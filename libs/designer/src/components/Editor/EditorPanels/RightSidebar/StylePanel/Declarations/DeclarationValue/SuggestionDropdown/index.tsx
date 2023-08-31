import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/decl-suggestion.pc";
import {
  SuggestionMenuContainer,
  SuggestionMenuProps,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";

export type SuggestionDropdownProps = {
  editorInput?: React.ReactChild;
} & SuggestionMenuProps;

export const SuggestionDropdown = ({
  editorInput,
  ...rest
}: SuggestionDropdownProps) => {
  return (
    <SuggestionMenuContainer
      {...rest}
      renderMenu={(options) => {
        return (
          <styles.DeclSuggestionMenu>
            {editorInput && (
              <>
                {editorInput}
                <styles.Divider />
              </>
            )}
            {options}
          </styles.DeclSuggestionMenu>
        );
      }}
    />
  );
};
