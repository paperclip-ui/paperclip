import React, { useReducer, useRef, useState } from "react";
import { reducer } from "./reducer";
import { getInitialState, getTokenAtBoundary } from "./state";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { serializeDeclaration } from "@paperclip-ui/proto-ext/lib/ast/serialize";
import { DeclarationValue as DeclarationValueExpr } from "@paperclip-ui/proto/lib/generated/ast/css";

export type DeclarationValueProps = {
  expression: DeclarationValueExpr;
};

export const DeclarationValue = ({ expression }: DeclarationValueProps) => {
  const [value, setValue] = useState(serializeDeclaration(expression));

  return <RawInput value={value} />;
};

type RawInputProps = {
  value: string;
};

const RawInput = (props: RawInputProps) => {
  const { ref, value, onKeyUp, onTextInputChanged, onBlur } =
    useRawInput(props);

  return (
    <TextInput
      ref={ref}
      value={value}
      onKeyUp={onKeyUp}
      onChange={onTextInputChanged}
      onBlur={onBlur}
    />
  );
};

const useRawInput = ({ value }: RawInputProps) => {
  const [state, dispatch] = useReducer(reducer, getInitialState(value));
  const token = getTokenAtBoundary(state);

  console.log("TOKEN::", token);

  const ref = useRef<HTMLInputElement>(null);
  const onKeyUp = (event: React.KeyboardEvent) => {
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

  return {
    ref,
    value: state.value,
    token,
    onKeyUp,
    onTextInputChanged,
    onBlur,
  };
};
