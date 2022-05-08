import { put, take, select, call, spawn } from "redux-saga/effects";
import { RootComponent } from "../components/root";
import * as ReactDOM from "react-dom";
import * as React from "react";
import { eventChannel } from "redux-saga";
import { OpenFileContext } from "../components/contexts";
export const reactSaga = ({ openFile }) => function* () {
    let dispatch = () => { };
    yield spawn(function* () {
        const chan = eventChannel(emit => {
            dispatch = emit;
            return () => { };
        });
        while (1) {
            yield put(yield take(chan));
        }
    });
    while (1) {
        // slight performance boost
        yield call(() => new Promise(requestAnimationFrame));
        const root = yield select();
        ReactDOM.render(React.createElement(OpenFileContext.Provider, { value: openFile }, React.createElement(RootComponent, {
            root,
            dispatch
        })), root.mount);
        yield take();
    }
};
//# sourceMappingURL=react.js.map