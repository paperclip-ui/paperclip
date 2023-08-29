import React from "react";
import {
  Arithmetic,
  DeclarationValue,
} from "@paperclip-ui/proto/lib/generated/ast/css";
import * as styles from "@paperclip-ui/designer/src/styles/token-input.pc";

export type InteractiveDeclValueProps = {
  value: DeclarationValue;
};

export const InteractiveDeclValue = ({ value }: InteractiveDeclValueProps) => {
  return <Expression value={value} />;
};

type ExpressionProps = {
  value: DeclarationValue;
};

const Expression = ({ value }: ExpressionProps) => {
  if (value.arithmetic) {
    return (
      <>
        <Expression value={value.arithmetic.left} />
        &nbsp;
        <styles.Token class="sugar">{value.arithmetic.operator}</styles.Token>
        &nbsp;
        <Expression value={value.arithmetic.left} />
      </>
    );
  } else if (value.commaList) {
    return join(
      value.commaList.items.map((value, i) => {
        return <Expression key={i} value={value} />;
      }),
      ", "
    );
  }

  return null;
};

const join = (items: any[], separator: any) => {
  return items.reduce((acc: any[], item, i) => {
    if (i === 0) {
      return [item];
    }
    return [...acc, separator, item];
  }, []);
};
