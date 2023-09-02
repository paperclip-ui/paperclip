import React, { memo, useCallback, useEffect, useRef, useState } from "react";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { DesignerEvent } from "@paperclip-ui/designer/src/events";
import { DeclarationValue } from "./DeclarationValue";
import { noop } from "lodash";
import {
  ComputedStyle,
  serializeDeclaration,
} from "@paperclip-ui/proto-ext/lib/ast/serialize";
import { NameInput } from "./NameInput";
import {
  getStyleableTargetId,
  getTargetExprId,
} from "@paperclip-ui/designer/src/state";
import { DeclName } from "./DeclName";
import classNames from "classnames";

type FieldProps = {
  name?: string;
  style?: ComputedStyle;
  onFocus?: () => void;
  onBlur?: () => void;
  onValueKeyDown?: (event: React.KeyboardEvent<any>) => void;
  isNew?: boolean;
};

export const Declaration = memo(
  ({
    name,
    style,
    onBlur = noop,
    onFocus = noop,
    onValueKeyDown = noop,
    isNew,
  }: FieldProps) => {
    const value = style && serializeDeclaration(style.value);
    const [name2, setName] = useState(name);
    const dispatch = useDispatch<DesignerEvent>();
    const targetId = useSelector(getStyleableTargetId);
    const ref = useRef(null);

    useEffect(() => {
      setName(name);
    }, [name]);

    const onValueChangeComplete = useCallback(
      (value: string, imports: Record<string, string>) => {
        dispatch({
          type: "ui/styleDeclarationsChangeCompleted",
          payload: {
            values: { [name2]: value },
            imports,
          },
        });
      },
      [name2]
    );

    const onValueChange = useCallback(
      (value: string) => {
        dispatch({
          type: "ui/styleDeclarationsChanged",
          payload: {
            values: { [name2]: value },
          },
        });
      },
      [name2]
    );

    const isInherited = style?.ownerId !== targetId;

    const nameInput = isNew ? (
      <NameInput name={name2} onChange={setName} />
    ) : (
      <DeclName name={name2} style={style} targetId={targetId} />
    );

    const input = (
      <DeclarationValue
        name={name2}
        value={isInherited ? undefined : value}
        placeholder={isInherited ? value : undefined}
        onKeyDown={onValueKeyDown}
        onChangeComplete={onValueChangeComplete}
        onChange={onValueChange}
      />
    );

    const onBlur2 = () => {
      setTimeout(() => {
        if (ref.current?.contains(document.activeElement)) {
          return;
        }
        onBlur();
      });
    };

    // default field input
    return (
      <inputStyles.Field
        ref={ref}
        onFocus={onFocus}
        onBlur={onBlur2}
        name={nameInput}
        input={input}
      />
    );
  }
);
