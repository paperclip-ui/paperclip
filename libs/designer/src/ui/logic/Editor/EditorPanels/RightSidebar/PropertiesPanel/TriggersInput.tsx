import React from "react";
import * as inputStyles from "@paperclip-ui/designer/src/ui/input.pc";
import { TriggerBodyItemCombo } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { TextInput } from "@paperclip-ui/designer/src/ui/logic/TextInput";
import { useEffect, useState } from "react";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";

export type TriggerInputProps = {
  onSave: (triggers: UpdateVariantTrigger[]) => void;
  triggers?: TriggerBodyItemCombo[];
};

export const TriggersInput = (props: TriggerInputProps) => {
  const {
    triggers,
    onSaveTrigger,
    showNewTriggerInput,
    onNewTriggerSave,
    onAddTriggerClick,
  } = useTriggersInput(props);

  const triggerInputs = [
    ...triggers.map((trigger, i) => {
      const onSave = (event: any) => onSaveTrigger(event, i);
      return (
        <TextInput
          key={i}
          placeholder="CSS Selector..."
          value={String(trigger)}
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
      root={{ onClick: onAddTriggerClick }}
    />,
  ].filter(Boolean);
  return (
    <>
      <inputStyles.Field name="triggers" input={triggerInputs[0]} />
      {triggerInputs.slice(1).map((input, i) => {
        return <inputStyles.Field name=" " key={i} input={input} />;
      })}
    </>
  );
};

const useTriggersInput = ({ onSave, triggers }: TriggerInputProps) => {
  const [triggerStrs, setTriggerStrs] = useState([]);
  const [showNewTriggerInput, setShowNewTriggerInput] = useState(false);

  useEffect(() => {
    setTriggerStrs(mapTriggers(triggers));
  }, [triggers]);

  const onSaveTrigger = (
    event: React.KeyboardEvent<HTMLInputElement>,
    index: number
  ) => {
    const value = event.currentTarget.value;
    const newStrs = [...triggerStrs];
    newStrs[index] = value;
    setTriggerStrs(newStrs);
    onSave(newStrs.map((str) => ({ str })));
  };

  const onNewTriggerSave = (
    event:
      | React.KeyboardEvent<HTMLInputElement>
      | React.FocusEvent<HTMLInputElement>
  ) => {
    const value = event.currentTarget.value;
    setShowNewTriggerInput(false);
    const newStrs = [...triggerStrs, value];
    setTriggerStrs(newStrs);
    onSave(newStrs.map((str) => ({ str })));
  };

  const onAddTriggerClick = () => {
    setShowNewTriggerInput(true);
  };

  return {
    onSaveTrigger,
    showNewTriggerInput,
    onNewTriggerSave,
    onAddTriggerClick,
    triggers: mapTriggers(triggers),
  };
};

export const mapTriggers = (triggers?: TriggerBodyItemCombo[]) =>
  (triggers ?? []).map((combo) => {
    return String(
      combo.items.find((item) => item.bool)?.bool.value ||
        combo.items.find((item) => item.str)?.str.value
    );
  });
