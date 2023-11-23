import React, { useEffect, useRef } from "react";
import * as styles from "@paperclip-ui/designer/src/ui/modal.pc";
import * as buttonStyles from "@paperclip-ui/designer/src/ui/button.pc";
import { Portal } from "../Portal";
import { getEditorState } from "../../../state";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { DesignerEvent } from "../../../events";
import { Confirm } from "../../../state/confirm";

export type ConfirmProps = {
  onClose: (yes: boolean) => void;
} & Confirm;

export const ConfirmContainer = () => {
  const { confirm } = useSelector(getEditorState);
  const dispatch = useDispatch<DesignerEvent>();

  const onConfirm = (yes) => {
    dispatch({
      type: "ui/confirmClosed",
      payload: { yes, details: confirm.details },
    });
  };

  if (!confirm) {
    return null;
  }

  return <BaseConfirm {...confirm} onClose={onConfirm} />;
};

export const BaseConfirm = ({
  title,
  text,
  okLabel,
  onClose,
}: ConfirmProps) => {
  const onConfirm = () => {
    onClose(true);
  };

  const onCancel = () => onClose(false);

  const okRef = useRef<HTMLButtonElement>();

  useEffect(() => {
    okRef.current.focus();
  }, []);

  return (
    <Portal>
      <styles.ModalContainer onBackgroundClick={onCancel}>
        <styles.Modal>
          <styles.ModalHeader onCloseClick={onCancel}>
            {title}
          </styles.ModalHeader>
          <styles.ModalContent>{text}</styles.ModalContent>
          <styles.ModalFooter
            rightControls={
              <>
                <buttonStyles.Button onClick={onCancel} class="secondary">
                  Cancel
                </buttonStyles.Button>
                <buttonStyles.Button ref={okRef} onClick={onConfirm}>
                  {okLabel}
                </buttonStyles.Button>
              </>
            }
          />
        </styles.Modal>
      </styles.ModalContainer>
    </Portal>
  );
};
