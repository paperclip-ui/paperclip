import { eachMenuItem, MenuItem, MenuItems } from "../menu/base";
import { EngineActionHandler } from "tandem-common";
import { Action } from "redux";
import { isInputSelected, RootState } from "../state";
import Mousetrap from "mousetrap";
import { Dispatch } from "react";

export const startShortcutsEngine =
  (items: MenuItems) =>
  (dispatch: Dispatch<Action>): EngineActionHandler<RootState> => {
    const bindMenuItem = (item: MenuItem) => {
      if (item.keyboardShortcut && item.action) {
        Mousetrap.bind(item.keyboardShortcut, (event) => {
          dispatch(item.action);
          console.log(isInputSelected());
          return !isInputSelected();
        });
      }
    };

    eachMenuItem(items, bindMenuItem);

    return (action: Action, state: RootState) => {};
  };
