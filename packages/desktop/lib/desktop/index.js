"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.init = void 0;
var redux_saga_1 = require("redux-saga");
var redux_1 = require("redux");
var reducers_1 = require("./reducers");
var sagas_1 = require("./sagas");
try {
    require("update-electron-app")();
}
catch (e) { }
var init = function (initialState) {
    var sagaMiddleware = (0, redux_saga_1.default)();
    var store = (0, redux_1.createStore)(reducers_1.rootReducer, initialState, (0, redux_1.applyMiddleware)(sagaMiddleware));
    sagaMiddleware.run(sagas_1.rootSaga);
};
exports.init = init;
//# sourceMappingURL=index.js.map