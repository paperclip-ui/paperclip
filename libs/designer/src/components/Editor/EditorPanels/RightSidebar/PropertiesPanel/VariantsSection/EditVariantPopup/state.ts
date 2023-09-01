import { TriggerBodyItemCombo } from "@paperclip-ui/proto/lib/generated/ast/pc";
import { UpdateVariantTrigger } from "@paperclip-ui/proto/lib/generated/ast_mutate/mod";

export type SaveOptions = {
  name: string;
  triggers: UpdateVariantTrigger[];
};

export type State = SaveOptions & {
  showNewTriggerInput: boolean;
};

export const getInitialState = (
  name: string,
  triggers: TriggerBodyItemCombo[]
): State => ({
  name,
  showNewTriggerInput: false,
  triggers: mapTriggers(triggers),
});

export const mapTriggers = (triggers: TriggerBodyItemCombo[]) =>
  triggers.map((combo) => {
    return {
      bool: combo.items.find((item) => item.bool)?.bool.value,
      str: combo.items.find((item) => item.str)?.str.value,
    };
  });
