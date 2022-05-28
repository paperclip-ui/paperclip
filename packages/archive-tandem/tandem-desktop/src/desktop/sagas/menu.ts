import {
  Menu,
  MenuItem,
  MenuItemConstructorOptions,
  app,
  clipboard,
} from "electron";
import { fork, put, take, takeEvery } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import { exec } from "child_process";
import { platform } from "os";
import {
  MAIN_WINDOW_OPENED,
  OPEN_PROJECT_MENU_ITEM_CLICKED,
  NEW_PROJECT_MENU_ITEM_CLICKED,
} from "../actions";
import { publicActionCreator, stripProtocol } from "tandem-common";
import {
  FileItemContextMenuAction,
  OpenTextEditorButtonClicked,
} from "@tandem-ui/designer/src/actions";

const shortcutKeyDown = publicActionCreator((type: string) => ({
  type,
}));

export function* shortcutsSaga() {
  yield take(MAIN_WINDOW_OPENED);
  yield fork(handleMenu);
  yield fork(handleFSItemContextMenuOptions);
}

function* handleFSItemContextMenuOptions() {
  yield takeEvery(
    "FILE_ITEM_CONTEXT_MENU_COPY_PATH_CLICKED",
    ({ item }: FileItemContextMenuAction) => {
      clipboard.writeText(stripProtocol(item.uri));
    }
  );
  yield takeEvery(
    "FILE_ITEM_CONTEXT_MENU_OPEN_IN_FINDER_CLICKED",
    ({ item }: FileItemContextMenuAction) => {
      const path = stripProtocol(item.uri);
    }
  );

  yield takeEvery(
    "FILE_ITEM_CONTEXT_MENU_OPEN_CLICKED",
    ({ item }: FileItemContextMenuAction) => {
      const path = stripProtocol(item.uri);
      exec(`open ${path.replace(/\s/g, "\\ ")}`);
    }
  );

  yield takeEvery(
    "OPEN_TEXT_EDITOR_BUTTON_CLICKED",
    ({ uri }: OpenTextEditorButtonClicked) => {
      const path = stripProtocol(uri);
      exec(`open ${path.replace(/\s/g, "\\ ")}`);
    }
  );
}

const cmdKey = platform() === "win32" ? "ctrl" : "meta";

function* handleMenu() {
  const menu = new Menu();

  const chan = eventChannel((emit) => {
    const tpl: MenuItemConstructorOptions[] = [
      {
        label: app.getName(),
        submenu: [
          { role: "about" },
          { type: "separator" },
          { role: "services", submenu: [] },
          { type: "separator" },
          { role: "hide" },
          // { role: "hideothers" },
          { role: "unhide" },
          { type: "separator" },
          { role: "quit" },
          { type: "separator" },
          { type: "separator" },
        ],
      },
      {
        label: "Edit",
        submenu: [
          {
            label: "Undo",
            accelerator: `${cmdKey}+z`,
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_UNDO_KEY_DOWN"));
            },
          },
          {
            label: "Redo",
            accelerator: `${cmdKey}+y`,
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_REDO_KEY_DOWN"));
            },
          },
          {
            label: "Convert to component",
            accelerator: "alt+c",
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_CONVERT_TO_COMPONENT_KEY_DOWN"));
            },
          },
          {
            label: "Wrap in slot",
            accelerator: "alt+s",
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_WRAP_IN_SLOT_KEY_DOWN"));
            },
          },
          { type: "separator" },
          { role: "cut" },
          { role: "copy" },
          { role: "paste" },
          // { role: "pasteandmatchstyle" },
          {
            label: "Delete",
            accelerator: "Backspace",
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_DELETE_KEY_DOWN"));
            },
          },
          {
            label: "Escape",
            accelerator: "Escape",
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_ESCAPE_KEY_DOWN"));
            },
          },
          // { role: "selectall" }
        ],
      },
      {
        label: "Insert",
        submenu: [
          {
            label: "Text",
            accelerator: "t",
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_T_KEY_DOWN"));
            },
          },
          {
            label: "Element",
            accelerator: "r",
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_R_KEY_DOWN"));
            },
          },
          {
            label: "Component",
            accelerator: "c",
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_C_KEY_DOWN"));
            },
          },
        ],
      },

      {
        label: "View",
        submenu: [
          {
            label: "Reload",
            accelerator: `${cmdKey}+r`,
            click: (a, window, event) => {
              emit(shortcutKeyDown("RELOAD"));
            },
          },
          { role: "toggledevtools" as any },
          { type: "separator" },
          ,
          // { role: "resetzoom" },
          {
            label: "Zoom In",
            accelerator: `${cmdKey}+=`,
            click: (a, window, event) => {
              emit(shortcutKeyDown("SHORTCUT_ZOOM_IN_KEY_DOWN"));
            },
          },
          {
            label: "Zoom Out",
            accelerator: `${cmdKey}+-`,
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_ZOOM_OUT_KEY_DOWN"));
            },
          },
          { type: "separator" },
          { role: "togglefullscreen" },
          {
            label: "Toggle Side Bar",
            accelerator: `${cmdKey}+b`,
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_TOGGLE_SIDEBAR"));
            },
          },
          {
            label: "Toggle Panel",
            accelerator: `${cmdKey}+j`,
            click: () => {
              emit(shortcutKeyDown("SHORTCUT_TOGGLE_PANEL"));
            },
          },
          {
            label: "Select Next Tab",
            accelerator: `${cmdKey}+shift+]`,
            click: (a, window, event) => {
              emit(shortcutKeyDown("SHORTCUT_SELECT_NEXT_TAB"));
            },
          },
          {
            label: "Select Previous Tab",
            accelerator: `${cmdKey}+shift+[`,
            click: (a, window, event) => {
              emit(shortcutKeyDown("SHORTCUT_SELECT_PREVIOUS_TAB"));
            },
          },
          {
            label: "Close Current Tab",
            accelerator: `${cmdKey}+w`,
            click: (a, window, event) => {
              emit(shortcutKeyDown("SHORTCUT_CLOSE_CURRENT_TAB"));
            },
          },
        ],
      },
      {
        label: "Help",
        submenu: [
          {
            label: "Tutorials",
            click: () => {
              emit({
                type: "LINK_CICKED",
                url: "https://www.youtube.com/playlist?list=PLCNS_PVbhoSXOrjiJQP7ZjZJ4YHULnB2y",
                "@@public": true,
              });
            },
          },
        ],
      },
    ];

    Menu.setApplicationMenu(Menu.buildFromTemplate(tpl));

    return () => {};
  });

  while (1) {
    const action = yield take(chan);
    yield put(action);
  }
}
