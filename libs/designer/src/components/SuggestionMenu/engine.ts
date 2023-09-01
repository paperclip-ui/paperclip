import { MutableRefObject } from "react";
import { SuggestionMenuEvent } from "./events";
import { State, getSelectedValues, isOpen } from "./state";

export type Callbacks = {
  onBlur: () => void;

  // TODO: this needs to be deprecated
  onOtherSelect: (value: string) => void;
  onSelect: (value: any[]) => void;
  onComplete: () => void;
};

export const suggestionMenuEngine =
  (callbacks: MutableRefObject<Callbacks>) => () => ({
    dispose() {},
    handleEvent(event: SuggestionMenuEvent, state: State, prevState: State) {
      switch (event.type) {
        case "blurred": {
          if (isOpen(state) && state.customValue != null) {
            callbacks.current.onOtherSelect(state.customValue);
          }
          break;
        }
        case "selected": {
          callbacks.current.onSelect(getSelectedValues(event.payload, state));
          break;
        }
        case "keyDown": {
          const { selectedValue } = event.payload;
          switch (event.payload.key) {
            case "Enter": {
              if (selectedValue) {
                callbacks.current.onSelect(
                  getSelectedValues(selectedValue, state)
                );
              } else if (state.customValue != null) {
                callbacks.current.onOtherSelect(state.customValue);
              }
              break;
            }
          }
          break;
        }
      }

      if (!state.isOpen && prevState.isOpen) {
        callbacks.current.onComplete();
      }
    },
  });
