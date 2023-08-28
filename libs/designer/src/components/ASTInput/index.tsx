import React, { useRef } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/token-input.pc";
import { Range } from "@paperclip-ui/proto/lib/generated/ast/base";

type GenericExpression = {
  id: string;
  kind: any;
  children: GenericExpression[];
};

type ExpressionComponent = React.ComponentType<{ value: GenericExpression }>;

type ExpressionInputProps = {
  onChange: (value: string) => void;
  children: any;
};

export const ExpressionInput = ({
  children,
  onChange,
}: ExpressionInputProps) => {
  const ref = useRef<HTMLDivElement>(null);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const target = event.target as HTMLDivElement;
    const value = target.textContent;
    if (value === "") {
      const prev =
        (target.previousElementSibling as HTMLElement) ??
        rightMostLeaf(target.parentElement);
      console.log(prev);

      if (prev) {
        prev.focus();
        const sel = window.getSelection();
        const range = document.createRange();
        range.setStart(prev, prev.textContent.length);
        range.collapse(true);
        sel.removeAllRanges();
        sel.addRange(range);
      }
    }
    event.stopPropagation();
    const textContent = ref.current.textContent;
    onChange(textContent);
  };

  return (
    <styles.TokenInput ref={ref} onKeyDown={onKeyDown}>
      {children}
    </styles.TokenInput>
  );
};

type ExpressionProps = {
  value: string;
  children: any;
  onChange?: (value: string) => void;
};

export const Expression = () => {
  return;
};

const rightMostLeaf = (parent: HTMLElement) => {
  let curr = parent;
  while (true) {
    const next = curr.lastElementChild as HTMLElement;
    if (!next) {
      return curr;
    }
    curr = next;
  }
};
