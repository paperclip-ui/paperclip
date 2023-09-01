import { BaseEvent } from "@paperclip-ui/common";
import { TriggerBodyItemCombo } from "@paperclip-ui/proto/lib/generated/ast/pc";

export type VariantSectionEvent =
  | BaseEvent<
      "propsChanged",
      {
        name: string;
        triggers: TriggerBodyItemCombo[];
      }
    >
  | BaseEvent<"nameChanged", string>
  | BaseEvent<"nameSaved", string>
  | BaseEvent<"addNewTriggerButtonClicked">
  | BaseEvent<"newTriggerSaved", string>
  | BaseEvent<"triggerSaved", { index: number; value: string }>;
