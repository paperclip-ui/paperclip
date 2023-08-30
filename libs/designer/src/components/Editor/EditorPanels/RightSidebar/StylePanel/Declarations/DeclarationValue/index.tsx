import React, {
  useCallback,
  useEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
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
import { serializeDeclaration } from "@paperclip-ui/proto-ext/lib/ast/serialize";
import { DeclarationValue as DeclarationValueExpr } from "@paperclip-ui/proto/lib/generated/ast/css";
import {
  SuggestionMenu,
  SuggestionMenuItem,
  SuggestionMenuSection,
} from "@paperclip-ui/designer/src/components/SuggestionMenu";
import { useSelector } from "@paperclip-ui/common";
import { getEditorState } from "@paperclip-ui/designer/src/state";
import { Token as SimpleExpression } from "./utils";

export type DeclarationValueProps = {
  name: string;
  value: string;
  isInherited?: boolean;
  onChange: (value: string, imports: Record<string, string>) => void;
  onTab?: (event: React.KeyboardEvent<void>) => void;
};

export const DeclarationValue = ({
  name,
  value = "",
  onChange,
  isInherited,
  onTab,
}: DeclarationValueProps) => {
  const state = useSelector(getEditorState);

  return (
    <RawInput
      value={value}
      isInherited={isInherited}
      getSuggestionItems={getDeclSuggestionItems(name, state)}
      onChange={onChange}
      onTab={onTab}
    />
  );
};

type RawInputProps = {
  isInherited: boolean;
  getSuggestionItems: (token: SimpleExpression) => RawInputValueSuggestion[];
  value: string;
  onChange: (value: string, imports: Record<string, string>) => void;
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
    onCustomSelect,
  } = useRawInput(props);

  const values = useMemo(() => [value], [value]);

  const menu = useCallback(() => {
    return getSuggestionItems(activeToken).map((item) => {
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
          filterText={item.value + item.source + item.preview}
        >
          {item.label ?? item.value}
        </SuggestionMenuItem>
      );
    });
  }, [activeToken, getSuggestionItems]);

  return (
    <SuggestionMenu
      values={values}
      open={showSuggestionMenu}
      menu={menu}
      onBlur={onBlur}
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
    </SuggestionMenu>
  );
};

const useRawInput = ({
  value,
  onChange,
  onTab,
  isInherited,
}: RawInputProps) => {
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

  const onSuggestionSelect = ([value]) => {
    dispatch({
      type: "suggestionSelected",
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

  useEffect(() => {
    if (value !== state.value) {
      onChange(state.value, state.valueNamespaces || {});
    }
  }, [state.value, state.valueNamespaces]);

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
    onKeyUp,
    onInputClick,
    onSuggestionMenuClose,
    onSuggestionSelect,
    onCustomSelect,
    onFocus,
    onBlur,
  };
};
