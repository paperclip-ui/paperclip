import { fork, select, take, put, spawn, call } from "redux-saga/effects";
import { eventChannel } from "redux-saga";
import { ipcMain, MenuItemConstructorOptions, Menu } from "electron";
import { DesktopState } from "../state";
import { ContextMenuOption } from "tandem-front-end";
import { dialog } from "electron";
import { normalizeFilePath } from "tandem-common";
export const pid = Date.now() + "_" + Math.random();

export function* ipcSaga() {
  yield fork(actionSaga);
  yield fork(apiSaga);
}

function* actionSaga() {
  const chan = takeIPCEvents("message");

  while (1) {
    const { arg: message, event } = yield take(chan);
    message["@@" + pid] = true;
    console.log("incomming IPC message:", message);
    yield spawn(function*() {
      yield put({ ...message, origin: event });
    });
  }
}

normalizeFilePath;

function* apiSaga() {
  yield fork(function* getProjectInfo() {
    const chan = takeIPCEvents("getProjectInfo");
    while (1) {
      const { event } = yield take(chan);
      const state: DesktopState = yield select();
      event.sender.send(
        "projectInfo",
        state.tdProject && {
          config: state.tdProject,
          path: state.tdProjectPath
        }
      );
    }
  });

  yield fork(function* openDialog() {
    const chan = takeIPCEvents("openDialog");
    while (1) {
      const {
        event,
        arg: { name, extensions }
      } = yield take(chan);
      const [filePath] = yield call(dialog.showOpenDialog, {
        filters: [
          {
            name,
            extensions
          }
        ],
        properties: ["openFile"]
      }) || [undefined];

      event.sender.send("openDialogResult", filePath);
    }
  });

  yield fork(function* openContextMenu() {
    const chan = takeIPCEvents("openContextMenu");
    while (1) {
      const {
        event,
        arg: { point, options }
      } = yield take(chan);
      const menuChan = eventChannel(emit => {
        const menu = generateMenu(options, emit);
        menu.popup({
          window: event.sender,
          x: Math.round(point.left),
          y: Math.round(point.top)
        });

        // come after click
        menu.once("menu-will-close", () => setTimeout(emit, 10, "CLOSED"));

        return () => {
          menu.closePopup();
        };
      });

      const action = yield take(menuChan);
      if (action !== "CLOSED") {
        yield put(action);
      }
    }
  });
}

const generateMenu = (options: ContextMenuOption[], dispatch: any) => {
  const tpl = generateMenuTpl(options, dispatch);
  const menu = Menu.buildFromTemplate(tpl);
  return menu;
};

const generateMenuTpl = (
  options: ContextMenuOption[],
  click: any
): MenuItemConstructorOptions[] => {
  return options.reduce((items, option, i) => {
    if (option.type === "group") {
      items = [...items, ...generateMenuTpl(option.options, click)];
      if (i !== options.length - 1) {
        items.push({ type: "separator" });
      }
      return items;
    } else if (option.type === "item") {
      return [
        ...items,
        {
          label: option.label,
          click: () => click(option.action)
        }
      ];
    }
  }, []);
};

const takeIPCEvents = (eventType: string) =>
  eventChannel(emit => {
    ipcMain.on(eventType, (event, arg) => emit({ event, arg }));
    return () => {};
  });
