import React, { useRef, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/ui/logic/Sidebar/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { TriggerBodyItemCombo } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { SidebarPopup } from "@paperclip-ui/designer/src/ui/logic/SidebarPopup";

import { mapTriggers, TriggersInput } from "../../TriggersInput";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";

export type EditVariantPopupProps = {
  onSave?: ({ name, triggers }: any) => void;
  onClose?: () => void;
  name?: string;
  triggers?: TriggerBodyItemCombo[];
};

export const EditVariantPopup = (props: EditVariantPopupProps) => {
  const { name, onClose } = props;
  const { onNameSave, onTriggersSave, onNameChange } =
    useEditVariantPopup(props);

  return (
    <SidebarPopup header="Edit variant" onCloseClick={onClose}>
      <sidebarStyles.SidebarPopupPanelContent>
        <inputStyles.Fields>
          <inputStyles.Field
            name="name"
            input={
              <TextInput
                key="input"
                value={name}
                autoFocus
                onChange={onNameChange}
                onEnter={onNameSave}
                onBlur={onNameSave}
              />
            }
          />
          <TriggersInput onSave={onTriggersSave} triggers={props.triggers} />
        </inputStyles.Fields>
      </sidebarStyles.SidebarPopupPanelContent>
    </SidebarPopup>
  );
};

const useEditVariantPopup = ({
  name,
  triggers,
  onSave,
}: EditVariantPopupProps) => {
  const callbacksRef = useRef<any>();
  callbacksRef.current = { onSave };

  const [newName, setName] = useState(name);

  const onNameChange = setName;

  const onNameSave = () => {
    console.log({
      name: newName,
      triggers: mapTriggers(triggers).map((str) => ({ str })),
    });
    onSave({
      name: newName,
      triggers: mapTriggers(triggers).map((str) => ({ str })),
    });
  };

  const onTriggersSave = (triggers: UpdateVariantTrigger[]) => {
    onSave({
      name,
      triggers,
    });
  };

  return {
    onSave,
    onNameSave,
    onNameChange,
    onTriggersSave,
  };
};
