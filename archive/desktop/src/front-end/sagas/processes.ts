import { fork, take, select, call, put, spawn } from "redux-saga/effects";
import { eventChannel, delay } from "redux-saga";
import * as terminate from "terminate";
import * as path from "path";
import { spawn as spawn2 } from "child_process";
import {
  BUILD_BUTTON_START_CLICKED,
  RootState,
  ScriptProcess,
  createScriptProcess,
  scriptProcessStarted,
  scriptProcessLog,
  scriptProcessStopped,
  buildScriptStarted,
  BUILD_SCRIPT_CONFIG_CHANGED,
  SCRIPT_PROCESS_CLOSED,
  BUILD_BUTTON_STOP_CLICKED,
  BUILD_BUTTON_OPEN_APP_CLICKED,
  TD_PROJECT_LOADED,
  UNLOADING,
  createUnloader,
  unloaderCreated,
  unloaderCompleted
} from "tandem-front-end";
import { stripProtocol } from "tandem-common";

export function* processSaga() {
  yield fork(handleStartBuild);
  yield fork(handleOpenApp);
}
const UNLOADER_TIMEOUT = 500;

function* handleStartBuild() {
  while (1) {
    yield take([BUILD_BUTTON_START_CLICKED]);
    yield call(startBuild);
  }
}

function* handleOpenApp() {
  while (1) {
    yield take(BUILD_BUTTON_OPEN_APP_CLICKED);
    const state: RootState = yield select();
    const openAppScript = state.projectInfo.config.scripts.openApp;
    yield call(
      spawnScript,
      openAppScript,
      "Open App",
      path.dirname(stripProtocol(state.projectInfo.path))
    );
  }
}

function* startBuild() {
  const state: RootState = yield select();
  const buildScript = state.projectInfo.config.scripts.build;
  const scriptProcess: ScriptProcess = yield call(
    spawnScript,
    buildScript,
    "Build",
    path.dirname(stripProtocol(state.projectInfo.path))
  );

  // check if process has been removed from state
  yield fork(function* handleScriptChanged() {
    while (1) {
      const action = yield take([
        BUILD_SCRIPT_CONFIG_CHANGED,
        BUILD_BUTTON_STOP_CLICKED,
        TD_PROJECT_LOADED
      ]);

      // slight pause to ensure that reducer is called first
      yield delay(0);

      if (action.type === BUILD_BUTTON_STOP_CLICKED) {
        break;
      }

      const state: RootState = yield select();
      const matchingProccess = state.scriptProcesses.find(
        proc => proc.id === scriptProcess.id
      );
      if (!matchingProccess) {
        yield call(startBuild);
        break;
      }
    }
  });

  yield put(buildScriptStarted(scriptProcess));
}

function* spawnScript(
  script: string,
  label: string,
  cwd: string
): IterableIterator<any> {
  const scriptProcess = createScriptProcess(label, script);

  yield put(scriptProcessStarted(scriptProcess));

  yield spawn(function*(): any {
    const channel = eventChannel<any>(emit => {
      console.log("spawning", script);
      const proc = spawn2(script, [], {
        shell: true,
        cwd
      });

      proc.stderr.on("data", chunk =>
        emit({
          type: "stderr",
          chunk
        })
      );

      proc.stdout.on("data", chunk =>
        emit({
          type: "stdout",
          chunk
        })
      );

      proc.on("exit", () => emit({ type: "close" }));
      proc.on("close", () => emit({ type: "close" }));

      return () => {
        console.log("terminate process", proc.pid);
        terminate(proc.pid);
      };
    });

    // check if process has been removed from state
    yield spawn(function*() {
      while (1) {
        yield take([
          BUILD_SCRIPT_CONFIG_CHANGED,
          SCRIPT_PROCESS_CLOSED,
          BUILD_BUTTON_STOP_CLICKED,
          TD_PROJECT_LOADED,
          UNLOADING
        ]);
        const state: RootState = yield select();
        const matchingProccess = state.scriptProcesses.find(
          proc => proc.id === scriptProcess.id
        );
        if (!matchingProccess) {
          const unloader = createUnloader();
          yield put(unloaderCreated(unloader));
          channel.close();

          // give some time for async terminator to work. Could
          // cause race conditions. 🙈
          yield call(delay, UNLOADER_TIMEOUT);
          yield put(unloaderCompleted(unloader));
          break;
        }
      }
    });

    while (1) {
      const event = yield take(channel);
      if (event.type === "close") {
        yield put(scriptProcessStopped(scriptProcess));
        break;
      } else if (event.type === "stdout") {
        yield put(
          scriptProcessLog(scriptProcess, {
            text: String(event.chunk),
            error: false
          })
        );
      } else if (event.type === "stderr") {
        yield put(
          scriptProcessLog(scriptProcess, {
            text: String(event.chunk),
            error: true
          })
        );
      }
    }
  });

  return scriptProcess;
}
