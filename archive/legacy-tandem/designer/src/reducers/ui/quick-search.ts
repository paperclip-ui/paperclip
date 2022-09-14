import { Action } from "redux";
import { produce } from "immer";
import {
  QuickSearchFilterChanged,
  QuickSearchItemClicked,
  QuickSearchResultItemSplitButtonClicked,
  QUICK_SEARCH_BACKGROUND_CLICK,
  QUICK_SEARCH_FILTER_CHANGED,
  QUICK_SEARCH_INPUT_ENTERED,
  QUICK_SEARCH_ITEM_CLICKED,
  QUICK_SEARCH_RESULT_ITEM_SPLIT_BUTTON_CLICKED,
} from "../../actions";
import {
  openFile,
  QuickSearchResultType,
  RootState,
  updateRootState,
} from "../../state";

export const quickSearchReducer = (state: RootState, action: Action) => {
  switch (action.type) {
    case QUICK_SEARCH_INPUT_ENTERED:
    case QUICK_SEARCH_ITEM_CLICKED: {
      const { item } = action as QuickSearchItemClicked;
      if (item.type === QuickSearchResultType.URL) {
        const uri = item.url;
        state = openFile(uri, false, false, state);
        state = updateRootState({ showQuickSearch: false }, state);
      } else {
      }
      return state;
    }
    case QUICK_SEARCH_RESULT_ITEM_SPLIT_BUTTON_CLICKED: {
      const { item } = action as QuickSearchResultItemSplitButtonClicked;
      if (item.type === QuickSearchResultType.URL) {
        state = openFile(item.url, false, true, state);
      }
      return state;
    }
    case QUICK_SEARCH_BACKGROUND_CLICK: {
      return (state = updateRootState({ showQuickSearch: false }, state));
    }

    case QUICK_SEARCH_FILTER_CHANGED: {
      const { value } = action as QuickSearchFilterChanged;
      state = produce(state, (newState) => {
        newState.quickSearch = {
          filter: value,
          matches: newState.quickSearch?.matches || [],
        };
      });
      return state;
    }
  }
  return state;
};
