import { throttle } from "lodash";
import { Dispatch } from "react";
import { Action } from "redux";
import {
  QuickSearchFilterChanged,
  quickSearchFilterResultLoaded,
  QUICK_SEARCH_FILTER_CHANGED,
} from "../actions";
import { QuickSearchResult } from "../state";

export type QuickSearchEngineOptions = {
  searchProject(value: string): Promise<QuickSearchResult[]>;
};

export const quickSearchEngine =
  ({ searchProject }: QuickSearchEngineOptions) =>
  (dispatch: Dispatch<Action>) => {
    const handleQuickSearchChange = throttle(async (action: Action) => {
      if (action.type !== QUICK_SEARCH_FILTER_CHANGED) {
        return;
      }
      const { value } = action as QuickSearchFilterChanged;

      dispatch(quickSearchFilterResultLoaded(await searchProject(value)));
    }, 50);

    return (action: Action) => {
      handleQuickSearchChange(action);
    };
  };
