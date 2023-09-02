import React, { useState } from "react";
import * as styles from "@paperclip-ui/designer/src/styles/styles-panel.pc";
import { ComputedStyle } from "@paperclip-ui/proto-ext/lib/ast/serialize";
import classNames from "classnames";
import { Portal } from "@paperclip-ui/designer/src/components/Portal";
import { usePositioner } from "@paperclip-ui/designer/src/components/hooks/usePositioner";

export type DeclNameProps = {
  name: string;
  style: ComputedStyle;
  targetId: string;
};

export const DeclName = ({ name, style, targetId }: DeclNameProps) => {
  const { onClick, open, anchorRef, targetRef } = useDeclName();

  return (
    <styles.DeclInheritanceInfo
      class={classNames({
        open,
      })}
    >
      <styles.DeclName
        ref={anchorRef}
        class={classNames({
          inherited: style.ownerId !== targetId,
        })}
        onClick={onClick}
      >
        {name}
      </styles.DeclName>
      {open && (
        <Portal>
          <styles.DeclInfoCard ref={targetRef}>
            <styles.InheritedDeclInfo
              class={classNames({
                otherVariant: false,
                mixin: true,
              })}
              name="something"
              value="rgba(0,0,0,0.2)"
            />
          </styles.DeclInfoCard>
        </Portal>
      )}
    </styles.DeclInheritanceInfo>
  );
};

const useDeclName = () => {
  const [open, setOpen] = useState(false);

  const { anchorRef, targetRef } = usePositioner();

  const onClick = () => {
    setOpen(true);
  };

  return { onClick, open, anchorRef, targetRef };
};
