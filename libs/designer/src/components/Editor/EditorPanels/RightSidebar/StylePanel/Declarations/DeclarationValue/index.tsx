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
import { Expression as SimpleExpression } from "./utils";

export type DeclarationValueProps = {
  name: string;
  expression: DeclarationValueExpr;
};

export const DeclarationValue = ({
  name,
  expression,
}: DeclarationValueProps) => {
  const [value, setValue] = useState(serializeDeclaration(expression));
  const state = useSelector(getEditorState);

  return (
    <RawInput
      value={value}
      getSuggestionItems={getDeclSuggestionItems(name, state)}
    />
  );
};

type RawInputProps = {
  getSuggestionItems: (token: SimpleExpression) => RawInputValueSuggestion[];
  value: string;
};

const RawInput = (props: RawInputProps) => {
  const { getSuggestionItems } = props;
  const {
    ref,
    activeToken,
    showSuggestionMenu,
    value,
    onKeyUp,
    onFocus,
    onSuggestionSelect,
    onSuggestionMenuClose,
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
      onSelect={onSuggestionSelect}
      onOtherSelect={onCustomSelect}
      onClose={onSuggestionMenuClose}
    >
      <TextInput ref={ref} value={value} onKeyUp={onKeyUp} onFocus={onFocus} />
    </SuggestionMenu>
  );
};

const useRawInput = ({ value }: RawInputProps) => {
  const [state, dispatch] = useReducer(reducer, getInitialState(value));
  const activeToken = getTokenAtCaret(state);

  const ref = useRef<HTMLInputElement>(null);
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

  useEffect(() => {
    if (state.caretPosition !== -1) {
      setTimeout(() => {
        ref.current.focus();
        ref.current.selectionStart = state.caretPosition;
        ref.current.selectionEnd = state.caretPosition;
      });
    }
  }, [state.caretPosition, state.showSuggestionMenu]);

  const onCustomSelect = (value: string) => {};

  return {
    ref,
    value: state.value,
    showSuggestionMenu: state.showSuggestionMenu && activeToken != null,
    activeToken,
    onKeyUp,
    onSuggestionMenuClose,
    onSuggestionSelect,
    onCustomSelect,
    onFocus,
    onBlur,
  };
};
