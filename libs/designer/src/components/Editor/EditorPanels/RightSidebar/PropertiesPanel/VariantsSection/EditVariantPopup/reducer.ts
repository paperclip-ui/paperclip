import produce from "immer";
import { VariantSectionEvent } from "./events";
import { State, mapTriggers } from "./state";

export const reducer = (state: State, event: VariantSectionEvent) => {
  switch (event.type) {
    case "propsChanged": {
      return produce(state, (draft) => {
        draft.triggers = mapTriggers(event.payload.triggers || []);
        draft.name = event.payload.name;
      });
    }
    case "nameChanged":
    case "nameSaved": {
      return produce(state, (draft) => {
        draft.name = event.payload;
      });
    }
    case "addNewTriggerButtonClicked": {
      return produce(state, (draft) => {
        draft.showNewTriggerInput = true;
      });
    }
    case "newTriggerSaved": {
      return produce(state, (draft) => {
        draft.triggers.push({ str: event.payload });
        draft.showNewTriggerInput = false;
      });
    }
    case "triggerSaved": {
      return produce(state, (draft) => {
        draft.triggers[event.payload.index] = { str: event.payload.value };
      });
    }
  }
  return state;
};
