import { useDispatch } from "@paperclip-ui/common";
import {
  TextInput,
  useTextInput,
} from "@paperclip-ui/designer/src/ui/components/TextInput";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { Canvas } from "@paperclip-ui/designer/src/state";
import { Box, Transform } from "@paperclip-ui/designer/src/state/geom";
import { TextNode } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { clamp } from "lodash";
import React, { memo, useState } from "react";
import * as styles from "./styles.pc";

export type TextEditorProps = {
  box: Box;
  expr: TextNode;
  canvas: Canvas;
};

export const TextEditor = memo((props: TextEditorProps) => {
  const { style, onBlur, inputProps } = useTextEditor(props);

  return (
    <div style={{ position: "absolute", ...style }}>
      <styles.TextInput {...inputProps} onBlur={onBlur} />
    </div>
  );
});

const CHAR_WIDTH = 10;

const useTextEditor = ({ box, canvas, expr }: TextEditorProps) => {
  const [internalValue, setInternalValue] = useState(expr.value);
  const dispatch = useDispatch<DesignerEvent>();

  const left =
    (box.x - canvas.scrollPosition.x) * canvas.transform.z + canvas.transform.x;
  const top =
    (box.y - canvas.scrollPosition.y) * canvas.transform.z + canvas.transform.y;

  const style = {
    left,
    top,
    width: Math.max(
      calcTextWidth(internalValue, { padding: 16 }),
      box.width,
      50
    ),
    transform: `scale(${canvas.transform.z})`,
    transformOrigin: "top left",
    height: 20,
  };

  const onSave = () => {
    dispatch({
      type: "ui/toolsTextEditorChanged",
      payload: { text: internalValue },
    });
  };

  const onEnter = onSave;
  const onBlur = onSave;
  const onChange = setInternalValue;

  const inputProps = useTextInput({
    value: expr.value,
    select: true,
    onEnter: onEnter,
    onChange,
  });

  return {
    inputProps,
    onBlur,
    style,
  };
};

const calcTextWidth = (text: string, style: any) => {
  const span = document.createElement("span");
  Object.assign(span.style, { display: "inline-block", opacity: 0, ...style });
  span.textContent = text;
  document.body.appendChild(span);
  const width = span.getBoundingClientRect().width;
  document.body.removeChild(span);
  return width;
};
