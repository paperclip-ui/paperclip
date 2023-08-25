import React from "react";
import * as styles from "@paperclip-ui/designer/src/styles/modal.pc";
import * as buttonStyles from "@paperclip-ui/designer/src/styles/button.pc";
import { Portal } from "../Portal";
import { TextInput } from "../TextInput";
import { getEditorState } from "../../state";
import { useDispatch, useSelector } from "@paperclip-ui/common";
import { DesignerEvent } from "../../events";

export type PromptProps = {
  title: string;
  placeholder: string;
  okLabel: string;
  onClose: (value?: string) => void;
  defaultValue?: string;
};

export const PromptContainer = () => {
  const { prompt } = useSelector(getEditorState);
  const dispatch = useDispatch<DesignerEvent>();

  const onSave = (value) => {
    dispatch({
      type: "ui/promptClosed",
      payload: { value, details: prompt.details },
    });
  };

  if (!prompt) {
    return null;
  }

  return <Prompt {...prompt} onClose={onSave} />;
};

export const Prompt = ({
  title,
  placeholder,
  defaultValue,
  okLabel,
  onClose,
}: PromptProps) => {
  const [value, setValue] = React.useState(defaultValue);
  const onSave = () => {
    onClose(value);
  };

  const onCancel = () => onClose();

  return (
    <Portal>
      <styles.ModalContainer onBackgroundClick={onCancel}>
        <styles.Modal>
          <styles.ModalHeader onCloseClick={onCancel}>
            {title}
          </styles.ModalHeader>
          <styles.ModalContent>
            <TextInput
              large
              autoFocus
              placeholder={placeholder}
              onChange={setValue}
              onSave={onSave}
            />
          </styles.ModalContent>
          <styles.ModalFooter
            rightControls={
              <>
                <buttonStyles.Button onClick={onCancel} class="secondary">
                  Cancel
                </buttonStyles.Button>
                <buttonStyles.Button onClick={onSave}>
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
