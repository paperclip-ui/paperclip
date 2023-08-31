import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
} from "react";
import { reducer } from "./reducer";
import {
  RawInputValueSuggestion,
  RawInputValueSuggestionKind,
  getDeclSuggestionItems,
  getInitialState,
  getTokenAtCaret,
} from "./state";

import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";

import {
  SuggestionMenuItem,
  SuggestionMenuSection,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";
import { useSelector } from "@paperclip-ui/common";
import { getEditorState } from "@paperclip-ui/designer/src/state";
import { Token as SimpleExpression, getTokenValue } from "./utils";
import { DeclarationValueType, inferDeclarationValueType } from "./css-utils";
import { ColorInput } from "./ValueInputs/color";
import { DeclSuggestionMenu } from "./SuggestionDropdown";

export type DeclarationValueProps = {
  name: string;
  value: string;
  isInherited?: boolean;
  onSave: (value: string, imports: Record<string, string>) => void;
  onTab?: (event: React.KeyboardEvent<void>) => void;
};

export const DeclarationValue = ({
  name,
  value = "",
  onSave,
  isInherited,
  onTab,
}: DeclarationValueProps) => {
  const state = useSelector(getEditorState);

  return (
    <RawInput
      value={value}
      isInherited={isInherited}
      getSuggestionItems={getDeclSuggestionItems(name, state)}
      onSave={onSave}
      onTab={onTab}
    />
  );
};

type RawInputProps = {
  isInherited: boolean;
  getSuggestionItems: (token: SimpleExpression) => RawInputValueSuggestion[];
  value: string;
  onSave: (value: string, imports: Record<string, string>) => void;
  onTab: (event: React.KeyboardEvent<void>) => void;
};

const RawInput = (props: RawInputProps) => {
  const { getSuggestionItems, isInherited } = props;
  const {
    ref,
    activeToken,
    showSuggestionMenu,
    value,
    onKeyUp,
    onBlur,
    onFocus,
    onKeyDown,
    onSuggestionSelect,
    onSuggestionMenuClose,
    onInputClick,
    onCustomInputChange,
    onCustomSelect,
  } = useRawInput(props);

  const values = useMemo(() => [value], [value]);
  const tokenValue = getTokenValue(activeToken);
  const valueType = inferDeclarationValueType(tokenValue);

  let editorInput = null;

  if (valueType === DeclarationValueType.Color) {
    editorInput = (
      <ColorInput value={tokenValue} onChange={onCustomInputChange} />
    );
  }

  const menu = useCallback(() => {
    const items = [];

    items.push(
      ...getSuggestionItems(activeToken).map((item) => {
        if (item.kind === RawInputValueSuggestionKind.Section) {
          return (
            <SuggestionMenuSection key={item.label}>
              {item.label}
            </SuggestionMenuSection>
          );
        }
        return (
          <SuggestionMenuItem
            key={item.id}
            value={item.value}
            selectValue={item}
            filterText={
              item.value + item.source + item.previewValue + item.label
            }
          >
            <inputStyles.TokenMenuContent
              style={{ "--color": item.previewValue }}
              context={item.source?.split("/").pop()}
            >
              {item.label ?? item.value}
            </inputStyles.TokenMenuContent>
          </SuggestionMenuItem>
        );
      })
    );

    return items;
  }, [activeToken, getSuggestionItems]);

  return (
    <DeclSuggestionMenu
      values={values}
      open={showSuggestionMenu}
      menu={menu}
      onBlur={onBlur}
      editorInput={editorInput}
      onSelect={onSuggestionSelect}
      onOtherSelect={onCustomSelect}
      onClose={onSuggestionMenuClose}
    >
      <TextInput
        ref={ref}
        value={value}
        onKeyUp={onKeyUp}
        placeholder={isInherited ? value : undefined}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onClick={onInputClick}
      />
    </DeclSuggestionMenu>
  );
};

const useRawInput = ({ value, onSave, onTab, isInherited }: RawInputProps) => {
  const [state, dispatch] = useReducer(
    reducer,
    getInitialState(isInherited ? "" : value)
  );
  const activeToken = getTokenAtCaret(state);

  const ref = useRef<HTMLInputElement>(null);
  const onKeyDown = (event: React.KeyboardEvent<any>) => {
    if (event.key === "Tab" && onTab) {
      onTab(event);
    }
  };

  const onKeyUp = () => {
    dispatch({
      type: "keyDown",
      payload: {
        caretPosition: ref.current.selectionStart,
        value: ref.current.value,
      },
    });
  };
  const onBlur = () => {
    dispatch({
      type: "blurred",
    });
  };
  const onFocus = () => {
    dispatch({
      type: "focused",
      payload: {
        caretPosition: ref.current.selectionStart,
      },
    });
  };

  const onSuggestionSelect = ([item]) => {
    dispatch({
      type: "suggestionSelected",
      payload: {
        item,
      },
    });
  };

  const onCustomInputChange = (value: string) => {
    dispatch({
      type: "customInputChanged",
      payload: {
        value,
      },
    });
  };

  const onSuggestionMenuClose = () =>
    dispatch({
      type: "suggestionMenuClose",
    });
  const onInputClick = () => {
    dispatch({
      type: "inputClicked",
      payload: { caretPosition: ref.current.selectionStart },
    });
  };

  // TODO: probably want to incorporate onChange and onChangeComplete where
  // onChange fires temporary changes
  useEffect(() => {
    if (state.shouldPersist) {
      onSave(state.value, state.imports);
    }
  }, [state.shouldPersist, state.value]);

  useEffect(() => {
    if (state.caretPosition !== -1 && state.active) {
      setTimeout(() => {
        ref.current.focus();
        ref.current.selectionStart = state.caretPosition;
        ref.current.selectionEnd = state.caretPosition;
      });
    }
  }, [state.caretPosition, state.active, state.showSuggestionMenu]);

  const onCustomSelect = (value: string) => {};

  return {
    ref,
    value: state.value,
    showSuggestionMenu: state.showSuggestionMenu && activeToken != null,
    activeToken,
    onKeyDown,
    onCustomInputChange,
    onKeyUp,
    onInputClick,
    onSuggestionMenuClose,
    onSuggestionSelect,
    onCustomSelect,
    onFocus,
    onBlur,
  };
};
