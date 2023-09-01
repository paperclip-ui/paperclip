import { MutableRefObject } from "react";
import { DeclarationValueEvent } from "./events";
import { State } from "./state";

type Callbacks = {
  onChangeComplete(value: string, imports: Record<string, string>): void;
  onChange(value: string): void;
};

export const engine = (callbacks: MutableRefObject<Callbacks>) => () => {
  return {
    dispose() {},
    handleEvent(event: DeclarationValueEvent, state: State) {
      switch (event.type) {
        case "blurred":
        case "suggestionSelected":
        case "customInputChangeComplete":
        case "inputClicked": {
          callbacks.current.onChangeComplete(state.value, state.imports);
          break;
        }
        case "textInputChanged":
        case "customInputChanged": {
          callbacks.current.onChange(state.value);
          break;
        }
      }
    },
  };
};
