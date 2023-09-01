import { BaseEvent } from "@paperclip-ui/common";
import { StatefulProps } from "./state";

export type Selected = BaseEvent<"selected", any>;

export type SuggestionMenuEvent =
  | BaseEvent<"blurred">
  | BaseEvent<"focused">
  | BaseEvent<"inputClicked">
  | BaseEvent<"inputChanged", string>
  | BaseEvent<
      "keyDown",
      {
        key: string;
        menuLength: number;
        selectedValue: any;
      }
    >
  | BaseEvent<"propsChanged", StatefulProps>
  | Selected;
