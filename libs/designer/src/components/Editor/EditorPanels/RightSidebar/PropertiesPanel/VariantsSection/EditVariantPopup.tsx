import React, { useEffect, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import {
  TriggerBodyItem,
  TriggerBodyItemCombo,
} from "@paperclip-ui/proto/lib/generated/ast/pc";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";
import produce from "immer";

export type SaveOptions = {
  name: string;
  triggers: UpdateVariantTrigger[];
};

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
    state,
    onSaveTrigger,
  } = useEditVariantPopup(props);

  const triggerInputs = [
    ...state.triggers.map((trigger, i) => {
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
    <sidebarStyles.SidebarPopup header="Edit variant" onCloseClick={onClose}>
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
    </sidebarStyles.SidebarPopup>
  );
};

const mapTriggers = (triggers: TriggerBodyItemCombo[]) =>
  triggers.map((combo) => {
    return {
      bool: combo.items.find((item) => item.bool)?.bool.value,
      str: combo.items.find((item) => item.str)?.str.value,
    };
  });

const useEditVariantPopup = ({
  name,
  triggers,
  onSave,
}: EditVariantPopupProps) => {
  const [state, setState] = useState<SaveOptions>({
    name,
    triggers: triggers ? mapTriggers(triggers) : [],
  });
  const [showNewTriggerInput, setShowNewTriggerInput] = useState(false);

  useEffect(() => {
    setState((state) =>
      produce(state, (newState) => {
        newState.triggers = triggers ? mapTriggers(triggers) : [];
      })
    );
  }, [triggers]);

  useEffect(() => {
    setState((state) =>
      produce(state, (newState) => {
        newState.name = name;
      })
    );
  }, [name]);

  const persist = (update: (state: SaveOptions) => SaveOptions) => {
    setShowNewTriggerInput(false);
    setState((state) => {
      const newState = update(state);
      onSave(newState);
      return newState;
    });
  };

  const onNameChange = (name: string) => {
    setState({
      ...state,
      name,
    });
  };

  const onNameSave = (
    event: React.KeyboardEvent<any> | React.FocusEvent<any>
  ) => {
    const value = event.currentTarget.value;
    persist((state) =>
      produce(state, (newState) => {
        newState.name = value;
      })
    );
  };

  const onAddTriggerClick = () => {
    setShowNewTriggerInput(true);
  };

  const onNewTriggerSave = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.value;

    persist((state) =>
      produce(state, (newState) => {
        newState.triggers.push({ str: value });
      })
    );
  };

  const onSaveTrigger = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.currentTarget.value;
    persist((state) =>
      produce(state, (newState) => {
        newState.triggers[index] = { str: value };
      })
    );
  };

  return {
    triggers,
    onSave,
    onNameSave,
    onAddTriggerClick,
    onNameChange,
    showNewTriggerInput,
    state,
    onSaveTrigger,
    onNewTriggerSave,
  };
};
