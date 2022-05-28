import { eachMenuItem, MenuItem, MenuItems } from "../menu/base";
import { EngineActionHandler } from "tandem-common";
import { Action } from "redux";
import { RootState } from "../state";
import Mousetrap from "mousetrap";
import { Dispatch } from "react";

export const startShortcutsEngine =
  (items: MenuItems) =>
  (dispatch: Dispatch<Action>): EngineActionHandler<RootState> => {
    const bindMenuItem = (item: MenuItem) => {
      if (item.keyboardShortcut && item.action) {
        Mousetrap.bind(item.keyboardShortcut, () => {
          dispatch(item.action);
          return false;
        });
      }
    };

    eachMenuItem(items, bindMenuItem);

    return (action: Action, state: RootState) => {};
  };
