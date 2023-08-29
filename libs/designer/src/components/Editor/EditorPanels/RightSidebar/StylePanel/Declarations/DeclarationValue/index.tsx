import React, {
  useCallback,
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
  getTokenAtBoundary,
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
  getSuggestionItems: (filter: string) => RawInputValueSuggestion[];
  value: string;
};

const RawInput = (props: RawInputProps) => {
  const { getSuggestionItems } = props;
  const {
    ref,
    activeToken,
    value,
    onKeyUp,
    onFocus,
    onTextInputChanged,
    onSuggestionSelect,
    onCustomSelect,
    onBlur,
  } = useRawInput(props);

  const values = useMemo(() => [value], [value]);

  const menu = useCallback(() => {
    return getSuggestionItems(activeToken?.value || "").map((item) => {
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
          {item.value}
        </SuggestionMenuItem>
      );
    });
  }, [activeToken, getSuggestionItems]);

  return (
    <SuggestionMenu
      values={values}
      open={activeToken != null}
      menu={menu}
      onSelect={onSuggestionSelect}
      onOtherSelect={onCustomSelect}
    >
      <TextInput
        ref={ref}
        value={value}
        onKeyUp={onKeyUp}
        onFocus={onFocus}
        onChange={onTextInputChanged}
        onBlur={onBlur}
      />
    </SuggestionMenu>
  );
};

const useRawInput = ({ value }: RawInputProps) => {
  const [state, dispatch] = useReducer(reducer, getInitialState(value));
  const activeToken = getTokenAtBoundary(state);
  console.log(activeToken, state);

  const ref = useRef<HTMLInputElement>(null);
  const onKeyUp = () => {
    dispatch({
      type: "keyDown",
      payload: {
        caretPosition: ref.current.selectionStart,
      },
    });
  };
  const onTextInputChanged = (value: string) => {
    dispatch({
      type: "inputChanged",
      payload: {
        value,
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

  const onSuggestionSelect = (value: string[]) => {};

  const onCustomSelect = (value: string) => {
    console.log("OK");
    dispatch({
      type: "inputChanged",
      payload: {
        value,
      },
    });
  };

  return {
    ref,
    value: state.value,
    activeToken,
    onKeyUp,
    onSuggestionSelect,
    onCustomSelect,
    onTextInputChanged,
    onFocus,
    onBlur,
  };
};
