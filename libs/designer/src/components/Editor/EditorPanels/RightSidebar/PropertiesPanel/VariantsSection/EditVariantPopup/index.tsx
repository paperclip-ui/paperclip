import React, { useEffect, useRef, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import {
  TriggerBodyItem,
  TriggerBodyItemCombo,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { SidebarPopup } from "@paperclip-ui/designer/src/components/SidebarPopup";
import { useInlineMachine } from "@paperclip-ui/common";
import { reducer } from "./reducer";
import { Callbacks, engine } from "./engine";
import { SaveOptions, getInitialState } from "./state";
export { SaveOptions };

export type EditVariantPopupProps = {
  onSave?: ({ name, triggers }: SaveOptions) => void;
  onClose?: () => void;
  name?: string;
  triggers?: TriggerBodyItemCombo[];
};

export const EditVariantPopup = (props: EditVariantPopupProps) => {
  const { name, onClose } = props;
  const {
    showNewTriggerInput,
    onAddTriggerClick,
    onNameSave,
    onNewTriggerSave,
    triggers,
    onSaveTrigger,
  } = useEditVariantPopup(props);

  const triggerInputs = [
    ...triggers.map((trigger, i) => {
      const onSave = (event) => onSaveTrigger(event, i);
      return (
        <TextInput
          key={i}
          placeholder="CSS Selector..."
          value={trigger.str}
          onBlur={onSave}
          onEnter={onSave}
        />
      );
    }),
    showNewTriggerInput ? (
      <TextInput
        autoFocus
        key="new-trigger"
        placeholder="CSS Selector..."
        onBlur={onNewTriggerSave}
        onEnter={onNewTriggerSave}
      />
    ) : null,
    <inputStyles.AddListItemButton
      key="add-list-item-button"
      onClick={onAddTriggerClick}
    />,
  ].filter(Boolean);

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
                onEnter={onNameSave}
                onBlur={onNameSave}
              />
            }
          />
          <inputStyles.Field name="triggers" input={triggerInputs[0]} />
          {triggerInputs.slice(1).map((input, i) => {
            return <inputStyles.Field name=" " key={i} input={input} />;
          })}
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
  const callbacksRef = useRef<Callbacks>();
  callbacksRef.current = { onSave };

  const [state, dispatch] = useInlineMachine(
    reducer,
    engine(callbacksRef),
    getInitialState(name, triggers)
  );

  useEffect(() => {
    dispatch({ type: "propsChanged", payload: { name, triggers } });
  }, [name, triggers]);

  const onNameChange = (name: string) => {
    dispatch({ type: "nameChanged", payload: name });
  };

  const onNameSave = (
    event: React.KeyboardEvent<any> | React.FocusEvent<any>
  ) => {
    const value = event.currentTarget.value;
    dispatch({ type: "nameSaved", payload: value });
  };

  const onAddTriggerClick = () => {
    dispatch({ type: "addNewTriggerButtonClicked" });
  };

  const onNewTriggerSave = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.value;
    dispatch({ type: "newTriggerSaved", payload: value });
  };

  const onSaveTrigger = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.currentTarget.value;
    dispatch({ type: "triggerSaved", payload: { value, index } });
  };

  return {
    onSave,
    onNameSave,
    onAddTriggerClick,
    onNameChange,
    showNewTriggerInput: state.showNewTriggerInput,
    triggers: state.triggers,
    onSaveTrigger,
    onNewTriggerSave,
  };
};
