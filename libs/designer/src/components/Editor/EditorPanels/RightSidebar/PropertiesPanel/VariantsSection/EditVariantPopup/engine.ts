import { MutableRefObject } from "react";
import { SaveOptions, State } from "./state";
import { VariantSectionEvent } from "./events";

export type Callbacks = {
  onSave(info: SaveOptions): void;
};

export const engine = (ref: MutableRefObject<Callbacks>) => () => ({
  handleEvent(event: VariantSectionEvent, state: State) {
    switch (event.type) {
      case "newTriggerSaved":
      case "nameSaved": {
        console.log("STATE", state);

        ref.current.onSave({
          name: state.name,
          triggers: state.triggers,
        });
      }
    }
  },
  dispose() {},
});
