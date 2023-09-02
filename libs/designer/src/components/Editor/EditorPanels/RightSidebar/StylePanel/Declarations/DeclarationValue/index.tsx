import React, { useCallback, useEffect, useMemo, useRef } from "react";
import { reducer } from "./reducer";
import {
  RawInputValueSuggestion,
  RawInputValueSuggestionKind,
  getDeclSuggestionItems,
  getInitialState,
  getRenderedCssValue,
  getTokenAtCaret,
} from "./state";

import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useInlineMachine } from "@paperclip-ui/common";

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
import { engine } from "./engine";

export type DeclarationValueProps = {
  name?: string;
  value?: string;
  autoFocus?: boolean;
  placeholder?: string;
  onChange?: (value: string) => void;
  onChangeComplete: (value: string, imports: Record<string, string>) => void;
  onKeyDown?: (event: React.KeyboardEvent<any>) => void;
};

export const DeclarationValue = ({
  name,
  value = "",
  autoFocus,
  onChange,
  onChangeComplete,
  placeholder,
  onKeyDown,
}: DeclarationValueProps) => {
  const state = useSelector(getEditorState);

  return (
    <RawInput
      value={value}
      autoFocus={autoFocus}
      placeholder={placeholder}
      getSuggestionItems={getDeclSuggestionItems(name, state)}
      onChange={onChange}
      onChangeComplete={onChangeComplete}
      onKeyDown={onKeyDown}
    />
  );
};

type RawInputProps = {
  placeholder?: string;
  autoFocus?: boolean;
  getSuggestionItems: (token: SimpleExpression) => RawInputValueSuggestion[];
  value?: string;
  onChange: (value: string) => void;
  onChangeComplete: (value: string, imports: Record<string, string>) => void;
  onKeyDown: (event: React.KeyboardEvent<any>) => void;
};

const RawInput = (props: RawInputProps) => {
  const { autoFocus, getSuggestionItems, placeholder } = props;
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
    onTextInputChange,
    onInputClick,
    onCustomInputChangeComplete,
    onCustomInputChange,
  } = useRawInput(props);

  const state = useSelector(getEditorState);
  const tokenValue = getRenderedCssValue(getTokenValue(activeToken), state);
  const valueType = inferDeclarationValueType(tokenValue);

  let editorInput = null;

  if (valueType === DeclarationValueType.Color) {
    editorInput = (
      <ColorInput
        value={tokenValue}
        onChange={onCustomInputChange}
        onChangeComplete={onCustomInputChangeComplete}
      />
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
              title={item.previewValue}
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

  const values = useMemo(() => [value], [value]);

  return (
    <DeclSuggestionMenu
      values={values}
      open={showSuggestionMenu}
      menu={menu}
      editorInput={editorInput}
      onSelect={onSuggestionSelect}
      onComplete={onSuggestionMenuClose}
    >
      <TextInput
        ref={ref}
        autoFocus={autoFocus}
        value={value}
        onBlur={onBlur}
        onKeyUp={onKeyUp}
        onChange={onTextInputChange}
        placeholder={placeholder}
        onKeyDown={onKeyDown}
        onFocus={onFocus}
        onClick={onInputClick}
      />
    </DeclSuggestionMenu>
  );
};

const useRawInput = ({
  value,
  autoFocus,
  onChange,
  onChangeComplete,
  onKeyDown: onKeyDown2,
}: RawInputProps) => {
  const callbacks = useRef<any>();
  callbacks.current = {
    onChange,
    onChangeComplete,
  };

  const [state, dispatch] = useInlineMachine(
    reducer,
    engine(callbacks),
    getInitialState({ value, autoFocus })
  );

  useEffect(() => {
    dispatch({
      type: "propsChanged",
      payload: { autoFocus, value },
    });
  }, [value, autoFocus]);
  const activeToken = getTokenAtCaret(state);

  const ref = useRef<HTMLInputElement>(null);

  const onKeyUp = () => {
    dispatch({
      type: "keyUp",
      payload: {
        caretPosition: ref.current.selectionStart,
        value: ref.current.value,
      },
    });
  };

  const onKeyDown = (event: React.KeyboardEvent<any>) => {
    dispatch({
      type: "keyDown",
      payload: {
        key: event.key,
        selectionStart: ref.current.selectionStart,
        selectionLength: ref.current.selectionEnd - ref.current.selectionStart,
      },
    });
    if (onKeyDown2) {
      onKeyDown2(event);
    }
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
        caretPosition: ref.current?.selectionStart,
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
      payload: value,
    });
  };
  const onCustomInputChangeComplete = (value: string) => {
    dispatch({
      type: "customInputChangeComplete",
      payload: value,
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

  useEffect(() => {
    if (state.caretPosition !== -1 && state.active) {
      ref.current.selectionStart = state.caretPosition;
      ref.current.selectionEnd =
        state.caretPosition + (state.selectionLength || 0);
    }
  }, [
    state.value,
    state.caretPosition,
    state.active,
    state.showSuggestionMenu,
    state.selectionLength,
  ]);

  const onTextInputChange = (value: string) => {
    dispatch({
      type: "textInputChanged",
      payload: {
        value,
        caretPosition: ref.current.selectionStart,
      },
    });
  };

  return {
    ref,
    value: state.value,
    showSuggestionMenu: state.showSuggestionMenu,
    activeToken,
    onKeyDown,
    onCustomInputChange,
    onTextInputChange,
    onCustomInputChangeComplete,
    onKeyUp,
    onInputClick,
    onSuggestionMenuClose,
    onSuggestionSelect,
    onFocus,
    onBlur,
  };
};
