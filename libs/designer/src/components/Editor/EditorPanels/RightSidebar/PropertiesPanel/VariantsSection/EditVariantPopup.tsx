import React, { useEffect, useState } from "react";
import * as sidebarStyles from "@paperclip-ui/designer/src/styles/sidebar.pc";
import * as inputStyles from "@paperclip-ui/designer/src/styles/input.pc";
import { TextInput } from "@paperclip-ui/designer/src/components/TextInput";
import { TriggerBodyItem } from "@paperclip-ui/proto/lib/generated/ast/pc";
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
  triggers?: TriggerBodyItem[];
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
          onEnter={onSave}
        />
      );
    }),
    showNewTriggerInput ? (
      <TextInput
        autoFocus
        key="new-trigger"
        placeholder="CSS Selector..."
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
              />
            }
          />
          <inputStyles.Field name="triggers" input={triggerInputs[0]} />
          {triggerInputs.slice(1).map((input, i) => {
            return <inputStyles.Field key={i} input={input} />;
          })}
        </inputStyles.Fields>
      </sidebarStyles.SidebarPopupPanelContent>
    </sidebarStyles.SidebarPopup>
  );
};

const mapTriggers = (triggers: TriggerBodyItem[]) =>
  triggers.map((trigger) => {
    return {
      bool: trigger.bool?.value,
      str: trigger.str?.value,
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

  const onNameSave = (
    event: React.KeyboardEvent<any> | React.FocusEvent<any>
  ) => {
    persist((state) =>
      produce(state, (newState) => {
        newState.name = event.currentTarget.value;
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
    showNewTriggerInput,
    state,
    onSaveTrigger,
    onNewTriggerSave,
  };
};
