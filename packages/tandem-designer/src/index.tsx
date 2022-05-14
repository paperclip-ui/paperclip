import ReactDOM from "react-dom";
import React from "react";
import { RootComponent } from "./components/root";
import { configureStore } from "@reduxjs/toolkit";
import { rootReducer } from "./reducers";
import { Provider as ReduxProvider } from "react-redux";
import { INITIAL_STATE } from "./state";
import { FrontEndEngineOptions, reduxMiddleware } from "./engines";

export type InitOptions = {
  document: Document;
  engineOptions: FrontEndEngineOptions;
};

export const init = ({ document, engineOptions }: InitOptions) => {
  const element = document.createElement("div");
  const store = configureStore({
    reducer: rootReducer,
    preloadedState: INITIAL_STATE as any,
    middleware: (getDefaultMiddleware) =>
      getDefaultMiddleware().concat(reduxMiddleware(engineOptions)),
  });

  ReactDOM.render(
    <ReduxProvider store={store}>
      <RootComponent />
    </ReduxProvider>,
    element
  );

  return { element };
};
