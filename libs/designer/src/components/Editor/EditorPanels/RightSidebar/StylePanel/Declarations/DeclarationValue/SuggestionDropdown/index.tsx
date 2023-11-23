import React from "react";
import * as styles from "@paperclip-ui/designer/src/ui/decl-suggestion.pc";
import {
  SuggestionMenuContainer,
  SuggestionMenuProps,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";
import { MenuList } from "@paperclip-ui/designer/src/ui/menu.pc";

export type SuggestionDropdownProps = {
  editorInput?: React.ReactChild;
} & SuggestionMenuProps;

export const DeclSuggestionMenu = ({
  editorInput,
  ...rest
}: SuggestionDropdownProps) => {
  const { onInputMouseDown } = useDeclSuggestionMenu();

  return (
    <SuggestionMenuContainer
      {...rest}
      renderMenu={(options, props) => {
        return (
          <styles.DeclSuggestionMenu {...props}>
            {editorInput && (
              <>
                <div onMouseDown={onInputMouseDown}>{editorInput}</div>
                <styles.Divider />
              </>
            )}
            <MenuList>{options}</MenuList>
          </styles.DeclSuggestionMenu>
        );
      }}
    />
  );
};

const useDeclSuggestionMenu = () => {
  const onInputMouseDown = (event: React.MouseEvent) => {
    // prevent menu from being closed
    event.stopPropagation();

    // prevent from blurring
    event.preventDefault();
  };

  return {
    onInputMouseDown,
  };
};
