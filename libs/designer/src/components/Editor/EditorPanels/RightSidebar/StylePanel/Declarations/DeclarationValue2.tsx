import React, { useCallback } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/token-input.pc";
import * as ast from "@paperclip-ui/proto/lib/generated/ast/css";
import { ExpressionInput } from "@paperclip-ui/designer/src/components/ASTInput";

export type DeclarationValueProps = {
  value: ast.DeclarationValue;
};

export const DeclarationValue2 = ({ value }: DeclarationValueProps) => {
  const onChange = useCallback((value: string) => {
    console.log("VALUE");
  }, []);

  return (
    <ExpressionInput onChange={onChange}>
      <Expression value={value} />
    </ExpressionInput>
  );
};

type ExpressionProps<Value> = {
  value: Value;
};

const Expression = ({ value }: ExpressionProps<ast.DeclarationValue>) => {
  if (value.arithmetic) {
    return <Arithmetic value={value.arithmetic} />;
  }
  if (value.reference) {
    return <Reference value={value.reference} />;
  }
  return null;
};

const Arithmetic = ({ value }: ExpressionProps<ast.Arithmetic>) => {
  return (
    <>
      <Expression value={value.left} />
      <styles.Token class="sugar">&nbsp;</styles.Token>
      <styles.Token class="sugar">+</styles.Token>
      <styles.Token class="sugar">&nbsp;</styles.Token>
      <Expression value={value.right} />
    </>
  );
};

const Reference = ({ value }: ExpressionProps<ast.Reference>) => {
  // TODO: fetch reference

  return (
    <>
      <styles.Token class="reference">{value.path[0]}</styles.Token>
    </>
  );
};
