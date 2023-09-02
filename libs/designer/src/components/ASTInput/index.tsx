import React, { useCallback, useRef, useState } from "react";
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
  const [active, setActive] = useState(false);

  const onKeyDown = (event: React.KeyboardEvent) => {
    const target = event.target as HTMLDivElement;
    const value = target.textContent;
    event.stopPropagation();

    if (value === "" && event.key === "Backspace") {
      const prev = getPrevToken(target);
      if (prev) {
        moveCaretToEnd(prev);
      }
    }
    // console.log(document.getSelection().getRangeAt(0), target);
    // const range = document.getSelection().getRangeAt(0);
    // if (range.startOffset === 0) {
    //     const prev = getPrevToken(target);
    //     console.log("FOCUS", prev);
    //     prev.focus();
    //     moveCaretToEnd(prev);
    // }
    // const textContent = ref.current.textContent;
    // onChange(textContent);
  };

  const onFocus = useCallback((event: React.FocusEvent) => {
    setActive(true);
  }, []);

  const onBlur = useCallback(() => {
    setTimeout(() => {
      if (!ref.current.contains(document.activeElement)) {
        setActive(false);
      }
    });
  }, []);

  return (
    <styles.TokenInput
      ref={ref}
      onKeyDown={onKeyDown}
      onFocus={onFocus}
      onBlur={onBlur}
    >
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

const moveCaretToEnd = (element: HTMLElement) => {
  const sel = window.getSelection();
  const range = document.createRange();
  console.log(element, sel, element.textContent.length);
  range.setStart(element, element.textContent.length);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
};

const moveCaretToBeginning = (element: HTMLElement) => {
  const sel = window.getSelection();
  const range = document.createRange();
  range.setStart(element, 0);
  range.collapse(true);
  sel.removeAllRanges();
  sel.addRange(range);
};

const getPrevToken = (curr: HTMLElement) => {
  let prev = curr.previousElementSibling;
  if (prev) {
    return prev as HTMLElement;
  }
  const parent = prevAncestorSibling(curr);
  if (parent) {
    return rightMostDescendent(parent);
  }
  return null;
};

const getNextToken = (curr: HTMLElement) => {
  let next = curr.nextElementSibling;
  if (next) {
    return next as HTMLElement;
  }
  const parent = nextAncestorSibling(curr);
  if (parent) {
    return leftMostDescendent(parent);
  }
  return null;
};

const nextAncestorSibling = (descendent: HTMLElement): HTMLElement => {
  let curr = descendent.parentElement;
  while (curr) {
    if (curr.nextElementSibling) {
      do {
        curr = curr.nextElementSibling as HTMLElement;
      } while (curr && curr.nextElementSibling.textContent === "");
      if (curr) {
        return curr;
      }
    }
    curr = curr.parentElement;
  }

  return curr;
};

const prevAncestorSibling = (descendent: HTMLElement): HTMLElement => {
  let curr = descendent.parentElement;
  while (curr) {
    if (curr.previousElementSibling) {
      do {
        curr = curr.previousElementSibling as HTMLElement;
      } while (curr && curr.previousElementSibling.textContent === "");
      if (curr) {
        return curr;
      }
    }
    curr = curr.parentElement;
  }

  return curr;
};

const leftMostDescendent = (curr: HTMLElement): HTMLElement => {
  while (true) {
    let next = curr.firstElementChild as HTMLElement;
    if (!next) {
      break;
    }
    while (next.textContent === "") {
      next = next.nextElementSibling as HTMLElement;
    }
    curr = next;
  }
  return curr;
};

const rightMostDescendent = (curr: HTMLElement): HTMLElement => {
  while (true) {
    let next = curr.lastElementChild as HTMLElement;
    if (!next) {
      break;
    }
    while (next.textContent === "") {
      next = next.previousElementSibling as HTMLElement;
    }

    curr = next;
  }
  return curr;
};
