import React, { useCallback, useMemo, useRef } from "react";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { serializeDeclaration } from "@paperclip-ui/proto-ext/lib/ast/serialize";
import { DeclarationValue } from "@paperclip-ui/proto/lib/generated/ast/css";

export type DeclarationValueProps = {
  value: DeclarationValue;
};

export const DeclarationValue2 = ({ value }: DeclarationValueProps) => {
  const strValue = useMemo(() => {
    return serializeDeclaration(value);
  }, [value]);

  const ref = useRef(null);

  const onChange = useCallback((value: string) => {
    console.log("CHANGE", value);
  }, []);

  const onFocus = (event: React.FocusEvent) => {};

  return (
    <TextInput
      ref={ref}
      onFocus={onFocus}
      value={strValue}
      onChange={onChange}
    />
  );
};
