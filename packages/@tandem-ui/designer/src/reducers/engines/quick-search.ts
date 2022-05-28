import { Action } from "redux";
import {
  QuickSearchResultLoaded,
  QUICK_SEARCH_RESULT_LOADED,
} from "../../actions";
import { RootState, updateRootState } from "../../state";

export const quickSearchReducer = (state: RootState, action: Action) => {
  switch (action.type) {
    case QUICK_SEARCH_RESULT_LOADED: {
      const { matches } = action as QuickSearchResultLoaded;
      state = updateRootState(
        {
          quickSearch: {
            ...state.quickSearch,
            matches: [...matches].sort((a, b) => {
              return a.label < b.label ? -1 : 1;
            }),
          },
        },
        state
      );
      return state;
    }
  }
  return state;
};
