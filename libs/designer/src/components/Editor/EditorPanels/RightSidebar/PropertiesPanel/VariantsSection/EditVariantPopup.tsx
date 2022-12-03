import React from "react";
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

  return (
    <sidebarStyles.SidebarPopup header="Edit variant" onCloseClick={onClose}>
      <sidebarStyles.SidebarPopupPanelContent>
        <inputStyles.Fields>
          <inputStyles.Field
            name="name"
            input={<TextInput autoFocus onEnter={onNameEnter} />}
          />
        </inputStyles.Fields>
      </sidebarStyles.SidebarPopupPanelContent>
    </sidebarStyles.SidebarPopup>
  );
};
