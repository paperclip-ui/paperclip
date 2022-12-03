import React, { useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { TriggerBodyItem } from "@paperclip-ui/proto/lib/generated/ast/pc";

export type SaveOptions = {
  name: string;
};

export type EditVariantPopupProps = {
  onSave?: ({ name }: SaveOptions) => void;
  onClose?: () => void;
  name?: string;
  triggers?: TriggerBodyItem[];
};

export const EditVariantPopup = ({
  name,
  triggers,
  onSave,
  onClose,
}: EditVariantPopupProps) => {
  const onNameEnter = (event: React.KeyboardEvent<any>) => {
    onSave({ name: event.currentTarget.value });
  };

  const [showNewTriggerInput, setShowNewTriggerInput] = useState(false);

  const onAddTriggerClick = () => {
    setShowNewTriggerInput(true);
  };

  const triggerInputs = [
    showNewTriggerInput ? (
      <TextInput autoFocus placeholder="CSS Selector..." />
    ) : null,
    <inputStyles.AddListItemButton onClick={onAddTriggerClick} />,
  ].filter(Boolean);

  return (
    <sidebarStyles.SidebarPopup header="Edit variant" onCloseClick={onClose}>
      <sidebarStyles.SidebarPopupPanelContent>
        <inputStyles.Fields>
          <inputStyles.Field
            name="name"
            input={<TextInput value={name} autoFocus onEnter={onNameEnter} />}
          />
          <inputStyles.Field name="triggers" input={triggerInputs[0]} />
          {triggerInputs.slice(1).map((input) => {
            return <inputStyles.Field key={input.props.key} input={input} />;
          })}
        </inputStyles.Fields>
      </sidebarStyles.SidebarPopupPanelContent>
    </sidebarStyles.SidebarPopup>
  );
};
